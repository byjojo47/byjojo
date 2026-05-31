const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getOrCreateSettings } = require('./settingsController');
const {
  attachActiveOffersToProducts,
} = require('../utils/offerPricing');
const {
  validateDiscountCodeForSubtotal,
  incrementDiscountUsage,
} = require('../utils/discountPricing');
const {
  sendAdminOrderEmail,
  sendCustomerOrderEmail,
  sendCustomerPaymentStatusEmail,
  sendCustomerOrderStatusEmail,
} = require('../services/emailService');
const {
  sendOwnerOrderWhatsApp,
  sendOwnerOrderStatusWhatsApp,
  sendOwnerPaymentStatusWhatsApp,
} = require('../services/whatsappService');

const orderStatuses = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'awaiting-confirmation', 'paid'];

function getProductMainImage(product) {
  return (
    product.images?.find((image) => image.isMain)?.url ||
    product.images?.[0]?.url ||
    ''
  );
}

function normalizeQuantity(value) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return 0;
  return Math.floor(quantity);
}

function paymentMethodIsEnabled(settings, method) {
  if (method === 'cash') return settings?.payment?.cashEnabled !== false;
  if (method === 'instapay') return settings?.payment?.instapayEnabled !== false;
  return false;
}

async function buildSafeOrderItems(postedItems) {
  if (!Array.isArray(postedItems) || postedItems.length === 0) {
    const error = new Error('Add products before placing an order');
    error.status = 400;
    throw error;
  }

  const productIds = [
    ...new Set(
      postedItems
        .map((item) => String(item.product || ''))
        .filter(Boolean),
    ),
  ];

  const invalidId = productIds.find((id) => !mongoose.Types.ObjectId.isValid(id));

  if (invalidId) {
    const error = new Error('Invalid product in cart');
    error.status = 400;
    throw error;
  }

  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  }).populate('category');

  const productsWithOffers = await attachActiveOffersToProducts(products);
  const productMap = new Map(
    productsWithOffers.map((product) => [String(product._id), product]),
  );

  const mergedItems = new Map();

  for (const item of postedItems) {
    const productId = String(item.product || '');
    const quantity = normalizeQuantity(item.quantity);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error('Invalid product in cart');
      error.status = 400;
      throw error;
    }

    if (quantity < 1) {
      const error = new Error('Product quantity must be at least 1');
      error.status = 400;
      throw error;
    }

    const product = productMap.get(productId);

    if (!product) {
      const error = new Error('One of the products in your cart is no longer available');
      error.status = 400;
      throw error;
    }

    const current = mergedItems.get(productId);

    if (current) {
      current.quantity += quantity;
    } else {
      mergedItems.set(productId, {
        product,
        quantity,
      });
    }
  }

  return [...mergedItems.values()].map(({ product, quantity }) => {
    const stock = Number(product.stock || 0);

    if (stock < quantity) {
      const error = new Error(`${product.name} does not have enough stock`);
      error.status = 400;
      throw error;
    }

    const price = Number(product.finalPrice || product.offerPrice || product.price || 0);

    return {
      product: product._id,
      name: product.name,
      image: getProductMainImage(product),
      price,
      originalPrice: Number(product.originalPrice || product.price || 0),
      offerPrice: product.offerPrice || null,
      activeOffer: product.activeOffer || null,
      quantity,
    };
  });
}

async function changeStock(items, direction) {
  if (!items?.length) return;

  await Product.bulkWrite(
    items
      .filter((item) => item.product && Number(item.quantity || 0) > 0)
      .map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: direction * Number(item.quantity || 0) } },
        },
      })),
  );
}

async function reduceStock(items) {
  await changeStock(items, -1);
}

async function restoreStock(items) {
  await changeStock(items, 1);
}

async function ensureEnoughStockToReopen(items) {
  const productIds = items.map((item) => item.product).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } });

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );

  for (const item of items) {
    const product = productMap.get(String(item.product));

    if (!product) {
      const error = new Error(`${item.name || 'A product'} no longer exists, so this cancelled order cannot be reopened`);
      error.status = 400;
      throw error;
    }

    if (Number(product.stock || 0) < Number(item.quantity || 0)) {
      const error = new Error(`${product.name} does not have enough stock to reopen this order`);
      error.status = 400;
      throw error;
    }
  }
}

exports.createOrder = async (req, res) => {
  const settings = await getOrCreateSettings();
  const postedItems = req.body.items || [];
  const items = await buildSafeOrderItems(postedItems);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const deliveryFee = Number(settings.deliveryFee || 0);
  const paymentMethod = req.body.paymentMethod || 'cash';

  if (!['cash', 'instapay'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }

  if (!paymentMethodIsEnabled(settings, paymentMethod)) {
    return res.status(400).json({ message: 'Selected payment method is currently unavailable' });
  }

  const paymentDetails = req.body.paymentDetails || {};
  const codeFromRequest = req.body.discountCode || req.body.couponCode || '';

  let discountCode = '';
  let discountAmount = 0;
  let discountDocument = null;

  if (codeFromRequest) {
    const discountResult = await validateDiscountCodeForSubtotal(codeFromRequest, subtotal);
    discountCode = discountResult.normalizedCode;
    discountAmount = discountResult.discountAmount;
    discountDocument = discountResult.discountCode;
  }

  const paymentStatus = paymentMethod === 'instapay'
    ? paymentDetails.timing === 'pay-now'
      ? 'awaiting-confirmation'
      : 'pending'
    : 'pending';

  const total = Math.max(0, subtotal - discountAmount) + deliveryFee;

  const order = await Order.create({
    user: req.user?._id,
    customer: req.body.customer,
    items,
    subtotal,
    deliveryFee,
    discountCode,
    discountAmount,
    total,
    paymentMethod,
    paymentStatus,
    paymentDetails,
    inventoryRestored: false,
  });

  await reduceStock(items);
  await incrementDiscountUsage(discountDocument);

  sendAdminOrderEmail(order).catch(console.error);
  sendCustomerOrderEmail(order).catch(console.error);
  sendOwnerOrderWhatsApp(order).catch(console.error);

  res.status(201).json({ order });
};

exports.myOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ orders });
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find().sort('-createdAt');
  res.json({ orders });
};

exports.getConfirmationOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json({ order });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json({ order });
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  if (!orderStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const previousStatus = order.status;

  if (previousStatus === status) {
    return res.json({ order });
  }

  if (status === 'cancelled' && previousStatus !== 'cancelled' && !order.inventoryRestored) {
    await restoreStock(order.items);
    order.inventoryRestored = true;
  }

  if (previousStatus === 'cancelled' && status !== 'cancelled' && order.inventoryRestored) {
    await ensureEnoughStockToReopen(order.items);
    await reduceStock(order.items);
    order.inventoryRestored = false;
  }

  order.status = status;
  await order.save();

  if (['confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'].includes(status)) {
    sendCustomerOrderStatusEmail(order, previousStatus).catch(console.error);
  }

  sendOwnerOrderStatusWhatsApp(order, previousStatus).catch(console.error);

  res.json({ order });
};

exports.updatePaymentStatus = async (req, res) => {
  const { paymentStatus } = req.body;

  if (!paymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ message: 'Invalid payment status' });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const previousPaymentStatus = order.paymentStatus;

  if (previousPaymentStatus === paymentStatus) {
    return res.json({ order });
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  sendCustomerPaymentStatusEmail(order, previousPaymentStatus).catch(console.error);
  sendOwnerPaymentStatusWhatsApp(order, previousPaymentStatus).catch(console.error);

  res.json({ order });
};
