const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    notes: String,
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    originalPrice: Number,
    offerPrice: Number,
    activeOffer: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String,
      description: String,
      discountType: String,
      discountValue: Number,
      startsAt: Date,
      endsAt: Date,
    },
    quantity: Number,
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  discountCode: String,
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'instapay'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'awaiting-confirmation', 'paid'], default: 'pending' },
  paymentDetails: {
    timing: { type: String, enum: ['pay-now', 'pay-later', ''], default: '' },
    reference: String,
    proofSentVia: String,
    note: String,
  },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'], default: 'pending' },

  // This prevents restoring stock multiple times if admin changes status around.
  inventoryRestored: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);