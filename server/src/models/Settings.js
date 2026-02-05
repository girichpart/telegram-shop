const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  heroTitle: { type: String, default: 'grått' },
  heroSubtitle: { type: String, default: 'Новая коллекция / Systems' },
  heroDescription: { type: String, default: 'Городская экипировка, собранная как система.' },
  heroVideoUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
