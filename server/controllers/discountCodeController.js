const DiscountCode = require('../models/DiscountCode');
const { emailCustomers } = require('../services/emailService');
const {
  normalizeCode,
  validateDiscountCodeForSubtotal,
} = require('../utils/discountPricing');

function normalizePayload(body) {
  return {
    code: normalizeCode(body.code),
    discountType: body.discountType,
    discountValue: Number(body.discountValue || 0),
    minOrderAmount: Number(body.minOrderAmount || 0),
    usageLimit: Number(body.usageLimit || 0),
    expiresAt: body.expiresAt || null,
    isActive: Boolean(body.isActive),
  };
}

function validatePayload(payload) {
  if (!payload.code) {
    const error = new Error('Discount code is required');
    error.status = 400;
    throw error;
  }

  if (!['percentage', 'fixed'].includes(payload.discountType)) {
    const error = new Error('Invalid discount type');
    error.status = 400;
    throw error;
  }

  if (!Number.isFinite(payload.discountValue) || payload.discountValue <= 0) {
    const error = new Error('Discount value must be greater than 0');
    error.status = 400;
    throw error;
  }

  if (payload.discountType === 'percentage' && payload.discountValue > 100) {
    const error = new Error('Percentage discount cannot be more than 100%');
    error.status = 400;
    throw error;
  }

  if (!Number.isFinite(payload.minOrderAmount) || payload.minOrderAmount < 0) {
    const error = new Error('Minimum order must be 0 or more');
    error.status = 400;
    throw error;
  }

  if (!Number.isFinite(payload.usageLimit) || payload.usageLimit < 0) {
    const error = new Error('Usage limit must be 0 or more');
    error.status = 400;
    throw error;
  }
}

exports.validateCode = async (req, res) => {
  const { code, subtotal } = req.body;

  const result = await validateDiscountCodeForSubtotal(code, subtotal);

  res.json({
    discountCode: {
      _id: result.discountCode._id,
      code: result.discountCode.code,
      discountType: result.discountCode.discountType,
      discountValue: result.discountCode.discountValue,
      minOrderAmount: result.discountCode.minOrderAmount,
      usageLimit: result.discountCode.usageLimit,
      usedCount: result.discountCode.usedCount,
      expiresAt: result.discountCode.expiresAt,
      isActive: result.discountCode.isActive,
    },
    discountAmount: result.discountAmount,
  });
};

exports.getCodes = async (req, res) => {
  const codes = await DiscountCode.find().sort('-createdAt');
  res.json({ codes });
};

exports.createCode = async (req, res) => {
  const payload = normalizePayload(req.body);
  validatePayload(payload);

  const exists = await DiscountCode.findOne({ code: payload.code });

  if (exists) {
    return res.status(400).json({ message: 'Discount code already exists' });
  }

  const code = await DiscountCode.create(payload);

  res.status(201).json({ code });
};

exports.updateCode = async (req, res) => {
  const payload = normalizePayload(req.body);
  validatePayload(payload);

  const exists = await DiscountCode.findOne({
    code: payload.code,
    _id: { $ne: req.params.id },
  });

  if (exists) {
    return res.status(400).json({ message: 'Another discount code already uses this code' });
  }

  const code = await DiscountCode.findByIdAndUpdate(
    req.params.id,
    payload,
    { new: true },
  );

  if (!code) {
    return res.status(404).json({ message: 'Discount code not found' });
  }

  res.json({ code });
};

exports.deleteCode = async (req, res) => {
  const code = await DiscountCode.findByIdAndDelete(req.params.id);

  if (!code) {
    return res.status(404).json({ message: 'Discount code not found' });
  }

  res.json({ message: 'Discount code deleted' });
};

exports.emailCode = async (req, res) => {
  const code = await DiscountCode.findById(req.params.id);

  if (!code) {
    return res.status(404).json({ message: 'Discount code not found' });
  }

  const discountText = code.discountType === 'percentage'
    ? `${code.discountValue}%`
    : `${Number(code.discountValue || 0).toLocaleString()} EGP`;

  await emailCustomers(`ByJojo discount code: ${code.code}`, `
    <p>Your ByJojo discount code is ready for your next table linen order.</p>

    <div style="margin-top:18px;border:1px solid #E8DDCB;background:#FAF7EF;border-radius:18px;padding:18px;text-align:center;">
      <p style="margin:0 0 8px;color:#777060;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Use this code at checkout</p>

      <div style="display:inline-block;border:1px dashed #B99A5B;background:#ffffff;border-radius:16px;padding:14px 22px;color:#4F5B3A;font-size:24px;font-weight:900;letter-spacing:3px;">
        ${code.code}
      </div>

      <p style="margin:14px 0 0;color:#5d5a4d;">Discount: ${discountText}</p>
      <p style="margin:8px 0 0;color:#777060;font-size:13px;">Minimum order: ${code.minOrderAmount || 0} EGP</p>
    </div>

    <p style="margin-top:18px;">Choose your favorite ByJojo pieces, enter the code during checkout, and the discount will be applied automatically if the order is eligible.</p>
  `);

  res.json({ message: 'Discount code emailed to customers' });
};