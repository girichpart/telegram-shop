const express = require('express');
const Settings = require('../models/Settings');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();

const buildDefaults = () => ({
  heroTitle: 'grått',
  heroSubtitle: 'Новая коллекция / Systems',
  heroDescription: 'Городская экипировка, собранная как система.',
  heroVideoUrl: '/hero.mp4',
  heroTextScale: 1,
  heroTextColor: '#ffffff',
  heroTextOpacity: 0.85,
  webAccessEnabled: true,
  deliveryCdekEnabled: true,
  deliveryYandexEnabled: false,
  paymentYookassaEnabled: true,
  paymentYookassaLabel: 'Оплатить через ЮKassa',
  paymentYookassaImageUrl: '',
  telegramAdminChatId: '',
  telegramAdminChatIds: []
});

router.get('/', async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'main' })
      .sort({ updatedAt: -1 })
      .lean();
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json({
      ...buildDefaults(),
      ...(settings || {})
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', adminAuth, async (req, res) => {
  try {
    const allowedStringFields = [
      'heroTitle',
      'heroSubtitle',
      'heroDescription',
      'heroVideoUrl',
      'heroTextColor',
      'paymentYookassaLabel',
      'paymentYookassaImageUrl',
      'telegramAdminChatId'
    ];
    const allowedBooleanFields = ['deliveryCdekEnabled', 'deliveryYandexEnabled', 'paymentYookassaEnabled', 'webAccessEnabled'];
    const allowedNumberFields = ['heroTextScale', 'heroTextOpacity'];
    const allowedArrayFields = ['telegramAdminChatIds'];
    const payload = {};
    for (const key of allowedStringFields) {
      if (typeof req.body[key] === 'string') {
        const trimmed = req.body[key].trim();
        payload[key] = trimmed;
      }
    }
    for (const key of allowedBooleanFields) {
      if (typeof req.body[key] === 'boolean') {
        payload[key] = req.body[key];
      }
    }
    for (const key of allowedNumberFields) {
      if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== '') {
        const value = Number(req.body[key]);
        if (!Number.isNaN(value)) {
          payload[key] = value;
        }
      }
    }
    for (const key of allowedArrayFields) {
      if (Array.isArray(req.body[key])) {
        payload[key] = req.body[key].map(item => String(item || '').trim()).filter(Boolean);
      }
    }

    const updated = await Settings.findOneAndUpdate(
      { key: 'main' },
      { $set: payload, $setOnInsert: { key: 'main' } },
      { new: true, upsert: true }
    ).lean();

    if (updated?._id) {
      await Settings.deleteMany({ key: 'main', _id: { $ne: updated._id } });
    }

    res.json({
      ...buildDefaults(),
      ...(updated || {})
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
