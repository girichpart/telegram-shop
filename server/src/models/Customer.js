const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  telegramId: { type: String, index: true },
  telegramUsername: String,
  firstName: String,
  lastName: String,
  phone: { type: String, index: true },
  phoneOptOut: { type: Boolean, default: false },
  lastSeenAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
