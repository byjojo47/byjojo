const DiscountCode = require('../models/DiscountCode');

function normalizeCode(code = '') {
  return String(code || '').trim().toUpperCase();
}

function cleanMoney(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.round(number));
}

function calculateDiscountAmount(discountCode, subtotal) {
  const safeSubtotal = cleanMoney(subtotal);
  const value = Number(discountCode?.discountValue || 0);

  if (!discountCode || !Number.isFinite(value) || value <= 0) return 0;

  const rawDiscount = discountCode.discountType === 'percentage'
    ? safeSubtotal * (value / 100)
    : value;

  return Math.min(safeSubtotal, cleanMoney(rawDiscount));
}

async function validateDiscountCodeForSubtotal(code, subtotal) {
  const normalizedCode = normalizeCode(code);

  if (!normalizedCode) {
    return {
      discountCode: null,
      discountAmount: 0,
      normalizedCode: '',
    };
  }

  const discountCode = await DiscountCode.findOne({
    code: normalizedCode,
    isActive: true,
  });

  if (!discountCode) {
    const error = new Error('Invalid discount code');
    error.status = 404;
    throw error;
  }

  if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
    const error = new Error('Discount code expired');
    error.status = 400;
    throw error;
  }

  if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
    const error = new Error('Discount code limit reached');
    error.status = 400;
    throw error;
  }

  if (cleanMoney(subtotal) < cleanMoney(discountCode.minOrderAmount)) {
    const error = new Error('Order does not meet minimum amount');
    error.status = 400;
    throw error;
  }

  return {
    discountCode,
    discountAmount: calculateDiscountAmount(discountCode, subtotal),
    normalizedCode,
  };
}

async function incrementDiscountUsage(discountCode) {
  if (!discountCode?._id) return;

  await DiscountCode.findByIdAndUpdate(discountCode._id, {
    $inc: { usedCount: 1 },
  });
}

module.exports = {
  normalizeCode,
  calculateDiscountAmount,
  validateDiscountCodeForSubtotal,
  incrementDiscountUsage,
};