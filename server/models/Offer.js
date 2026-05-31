const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  discountType: { type: String, enum: ['percentage', 'fixed', 'salePrice'], required: true },
  discountValue: { type: Number, required: true },
  startsAt: Date,
  endsAt: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
