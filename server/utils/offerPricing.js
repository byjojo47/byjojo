const Offer = require('../models/Offer');

function cleanPrice(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.round(number));
}

function calculateOfferPrice(price, offer) {
  const basePrice = cleanPrice(price);
  const discountValue = Number(offer?.discountValue || 0);

  if (!offer || !Number.isFinite(discountValue)) return basePrice;

  if (offer.discountType === 'percentage') {
    return cleanPrice(basePrice - (basePrice * discountValue) / 100);
  }

  if (offer.discountType === 'fixed') {
    return cleanPrice(basePrice - discountValue);
  }

  if (offer.discountType === 'salePrice') {
    return cleanPrice(discountValue);
  }

  return basePrice;
}

function serializeOffer(offer) {
  if (!offer) return null;

  return {
    _id: offer._id,
    title: offer.title,
    description: offer.description || '',
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    startsAt: offer.startsAt,
    endsAt: offer.endsAt,
  };
}

function productToPlainObject(product) {
  if (!product) return null;
  if (typeof product.toObject === 'function') return product.toObject();
  return { ...product };
}

function offerAppliesToProduct(offer, productId) {
  return (offer.products || []).some((id) => String(id) === String(productId));
}

function getBestOfferForProduct(product, offers = []) {
  const basePrice = cleanPrice(product.price);
  const productId = product._id;

  const validOffers = offers
    .filter((offer) => offerAppliesToProduct(offer, productId))
    .map((offer) => ({
      offer,
      offerPrice: calculateOfferPrice(basePrice, offer),
    }))
    .filter((entry) => entry.offerPrice < basePrice)
    .sort((a, b) => a.offerPrice - b.offerPrice);

  return validOffers[0] || null;
}

async function getActiveOffersForProducts(productIds = []) {
  const ids = [...new Set(productIds.map((id) => String(id)).filter(Boolean))];

  if (!ids.length) return [];

  const now = new Date();

  return Offer.find({
    isActive: true,
    products: { $in: ids },
    $and: [
      {
        $or: [
          { startsAt: { $exists: false } },
          { startsAt: null },
          { startsAt: { $lte: now } },
        ],
      },
      {
        $or: [
          { endsAt: { $exists: false } },
          { endsAt: null },
          { endsAt: { $gte: now } },
        ],
      },
    ],
  }).lean();
}

async function attachActiveOffersToProducts(products = []) {
  const plainProducts = products.map(productToPlainObject).filter(Boolean);
  const productIds = plainProducts.map((product) => product._id);
  const activeOffers = await getActiveOffersForProducts(productIds);

  return plainProducts.map((product) => {
    const basePrice = cleanPrice(product.price);
    const bestOffer = getBestOfferForProduct(product, activeOffers);

    if (!bestOffer) {
      return {
        ...product,
        originalPrice: basePrice,
        finalPrice: basePrice,
        offerPrice: null,
        hasActiveOffer: false,
        activeOffer: null,
      };
    }

    return {
      ...product,
      originalPrice: basePrice,
      finalPrice: bestOffer.offerPrice,
      offerPrice: bestOffer.offerPrice,
      hasActiveOffer: true,
      activeOffer: serializeOffer(bestOffer.offer),
    };
  });
}

async function attachActiveOfferToProduct(product) {
  const [productWithOffer] = await attachActiveOffersToProducts(product ? [product] : []);
  return productWithOffer || null;
}

module.exports = {
  calculateOfferPrice,
  attachActiveOffersToProducts,
  attachActiveOfferToProduct,
};