const express = require('express');
const Settings = require('../models/Settings');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();

const buildDefaults = () => ({
  heroTitle: 'grått',
  heroSubtitle: 'Новая коллекция / Systems',
  heroDescription: 'Городская экипировка, собранная как система.',
  heroVideoUrl: '/hero.mp4'
});

router.get('/', async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'main' }).lean();
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
    const allowedFields = ['heroTitle', 'heroSubtitle', 'heroDescription', 'heroVideoUrl'];
    const payload = {};
    for (const key of allowedFields) {
      if (typeof req.body[key] === 'string') {
        const trimmed = req.body[key].trim();
        payload[key] = trimmed;
      }
    }

    const updated = await Settings.findOneAndUpdate(
      { key: 'main' },
      { $set: payload, $setOnInsert: { key: 'main' } },
      { new: true, upsert: true }
    ).lean();

    res.json({
      ...buildDefaults(),
      ...(updated || {})
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
