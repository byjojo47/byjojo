const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function money(value = 0) {
  return Number(value || 0);
}

function isRevenueOrder(order) {
  return order.status !== 'cancelled';
}

function isDeliveredOrder(order) {
  return order.status === 'delivered';
}

function itemTotal(item) {
  return money(item.price) * money(item.quantity);
}

function buildCustomerStats(users = [], orders = []) {
  const stats = new Map();

  users.forEach((user) => {
    stats.set(String(user._id), {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      orderCount: 0,
      totalSpent: 0,
      lastOrderAt: null,
    });
  });

  orders.forEach((order) => {
    if (!order.user) return;

    const userId = String(order.user);
    const entry = stats.get(userId);

    if (!entry) return;

    entry.orderCount += 1;

    if (isRevenueOrder(order)) {
      entry.totalSpent += money(order.total);
    }

    if (!entry.lastOrderAt || new Date(order.createdAt) > new Date(entry.lastOrderAt)) {
      entry.lastOrderAt = order.createdAt;
    }
  });

  return [...stats.values()].sort((a, b) => {
    const aDate = a.lastOrderAt || a.createdAt;
    const bDate = b.lastOrderAt || b.createdAt;
    return new Date(bDate) - new Date(aDate);
  });
}

function buildBestSellingProducts(orders = []) {
  const productStats = new Map();

  orders
    .filter(isRevenueOrder)
    .forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = String(item.product || item.name);

        const current = productStats.get(key) || {
          product: item.product,
          name: item.name,
          image: item.image,
          quantitySold: 0,
          revenue: 0,
        };

        current.quantitySold += money(item.quantity);
        current.revenue += itemTotal(item);

        productStats.set(key, current);
      });
    });

  return [...productStats.values()]
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 6);
}

exports.overview = async (req, res) => {
  const today = startOfToday();

  const [
    products,
    orders,
    customers,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    Product.find().populate('category').lean(),
    Order.find().sort('-createdAt').lean(),
    User.find({ role: 'user' }).select('fullName email phone createdAt').sort('-createdAt').lean(),
    Order.find().sort('-createdAt').limit(6).lean(),
    Product.find({ isActive: true, stock: { $lte: 3 } }).populate('category').sort('stock').limit(8).lean(),
  ]);

  const activeProducts = products.filter((product) => product.isActive !== false);
  const hiddenProducts = products.filter((product) => product.isActive === false);

  const revenueOrders = orders.filter(isRevenueOrder);
  const deliveredOrders = orders.filter(isDeliveredOrder);

  const revenue = revenueOrders.reduce((sum, order) => sum + money(order.total), 0);
  const deliveredRevenue = deliveredOrders.reduce((sum, order) => sum + money(order.total), 0);

  const todayOrders = orders.filter((order) => new Date(order.createdAt) >= today);
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const awaitingPaymentOrders = orders.filter((order) => order.paymentStatus === 'awaiting-confirmation');
  const deliveredCount = orders.filter((order) => order.status === 'delivered').length;
  const cancelledCount = orders.filter((order) => order.status === 'cancelled').length;

  const averageOrderValue = revenueOrders.length ? Math.round(revenue / revenueOrders.length) : 0;

  const customersList = buildCustomerStats(customers, orders);
  const bestSellingProducts = buildBestSellingProducts(orders);

  res.json({
    overview: {
      products: products.length,
      activeProducts: activeProducts.length,
      hiddenProducts: hiddenProducts.length,
      lowStockProducts: lowStockProducts.length,
      orders: orders.length,
      todayOrders: todayOrders.length,
      pendingOrders: pendingOrders.length,
      awaitingPaymentOrders: awaitingPaymentOrders.length,
      deliveredOrders: deliveredCount,
      cancelledOrders: cancelledCount,
      customers: customers.length,
      revenue,
      deliveredRevenue,
      averageOrderValue,
    },
    recentOrders,
    lowStockProducts,
    bestSellingProducts,
    customersList,
  });
};