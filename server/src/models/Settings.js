const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  heroTitle: { type: String, default: 'grått' },
  heroSubtitle: { type: String, default: 'Новая коллекция / Systems' },
  heroDescription: { type: String, default: 'Городская экипировка, собранная как система.' },
  heroVideoUrl: { type: String, default: '' },
  deliveryCdekEnabled: { type: Boolean, default: true },
  deliveryYandexEnabled: { type: Boolean, default: false },
  paymentYookassaEnabled: { type: Boolean, default: true },
  paymentYookassaLabel: { type: String, default: 'Оплатить через ЮKassa' },
  paymentYookassaImageUrl: { type: String, default: '' },
  telegramAdminChatId: { type: String, default: '' },
  telegramAdminChatIds: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
