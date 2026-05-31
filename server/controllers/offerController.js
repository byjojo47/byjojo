const Offer = require('../models/Offer');
const Product = require('../models/Product');
const { emailCustomers } = require('../services/emailService');

function normalizeProducts(products = []) {
  if (!Array.isArray(products)) return [];
  return [...new Set(products.map((product) => String(product)).filter(Boolean))];
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildOfferPayload(body) {
  const discountValue = Number(body.discountValue || 0);

  if (!body.title?.trim()) {
    const error = new Error('Offer title is required');
    error.status = 400;
    throw error;
  }

  if (!['percentage', 'fixed', 'salePrice'].includes(body.discountType)) {
    const error = new Error('Invalid offer discount type');
    error.status = 400;
    throw error;
  }

  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    const error = new Error('Offer discount value must be greater than 0');
    error.status = 400;
    throw error;
  }

  const products = normalizeProducts(body.products);

  if (!products.length) {
    const error = new Error('Choose at least one product for this offer');
    error.status = 400;
    throw error;
  }

  return {
    title: body.title.trim(),
    description: body.description || '',
    products,
    discountType: body.discountType,
    discountValue,
    startsAt: normalizeDate(body.startsAt),
    endsAt: normalizeDate(body.endsAt),
    isActive: Boolean(body.isActive),
  };
}

async function populateOffer(offer) {
  return Offer.findById(offer._id).populate('products').lean();
}

exports.getOffers = async (req, res) => {
  const offers = await Offer.find()
    .populate('products')
    .sort('-createdAt')
    .lean();

  res.json({ offers });
};

exports.createOffer = async (req, res) => {
  const payload = buildOfferPayload(req.body);
  const offer = await Offer.create(payload);
  const populatedOffer = await populateOffer(offer);

  res.status(201).json({ offer: populatedOffer });
};

exports.updateOffer = async (req, res) => {
  const payload = buildOfferPayload(req.body);

  const offer = await Offer.findByIdAndUpdate(
    req.params.id,
    payload,
    { new: true },
  );

  if (!offer) {
    return res.status(404).json({ message: 'Offer not found' });
  }

  const populatedOffer = await populateOffer(offer);

  res.json({ offer: populatedOffer });
};

exports.deleteOffer = async (req, res) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);

  if (!offer) {
    return res.status(404).json({ message: 'Offer not found' });
  }

  res.json({ message: 'Offer deleted' });
};

exports.emailOffer = async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate('products');

  if (!offer) {
    return res.status(404).json({ message: 'Offer not found' });
  }

  const productNames = offer.products?.length
    ? offer.products.map((product) => product.name).join(', ')
    : 'Selected ByJojo pieces';

  const discountLabel = offer.discountType === 'percentage'
    ? `${offer.discountValue}% off`
    : offer.discountType === 'fixed'
      ? `${offer.discountValue} EGP off`
      : `Sale price: ${offer.discountValue} EGP`;

  await emailCustomers(`ByJojo offer: ${offer.title}`, `
    <p>A ByJojo offer is now available for selected linen pieces.</p>

    <div style="margin-top:18px;border:1px solid #E8DDCB;background:#FAF7EF;border-radius:18px;padding:18px;">
      <h2 style="margin:0 0 10px;font-family:Georgia,serif;color:#2F3028;font-size:22px;">${offer.title}</h2>
      <p style="margin:0;color:#5d5a4d;">${offer.description || 'Explore the collection and enjoy this offer while it is active.'}</p>
      <p style="margin:14px 0 0;color:#4F5B3A;font-weight:800;">${discountLabel}</p>
      <p style="margin:10px 0 0;color:#777060;font-size:13px;">Applies to: ${productNames}</p>
    </div>

    <p style="margin-top:18px;">Visit the shop to see the updated offer prices and choose the piece that fits your next table setup.</p>
  `);

  res.json({ message: 'Offer emailed to customers' });
};