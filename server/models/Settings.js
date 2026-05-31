const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'ByJojo' },
  whatsappNumber: String,
  instagramUrl: String,
  contactEmail: String,
  deliveryFee: { type: Number, default: 50 },
  payment: {
    cashEnabled: { type: Boolean, default: true },
    instapayEnabled: { type: Boolean, default: true },
    instapayNumber: String,
    instapayQr: {
      url: String,
      publicId: String,
    },
  },
  announcementText: String,
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
