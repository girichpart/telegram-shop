const express = require('express');
const Customer = require('../models/Customer');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();

const buildPayload = (payload) => {
  const telegram = payload?.telegram || {};
  const phone = payload?.phone || '';
  return {
    telegramId: telegram.id ? String(telegram.id) : undefined,
    telegramUsername: telegram.username || '',
    firstName: telegram.firstName || telegram.first_name || '',
    lastName: telegram.lastName || telegram.last_name || '',
    phone,
    lastSeenAt: new Date()
  };
};

router.post('/', async (req, res) => {
  try {
    const payload = buildPayload(req.body || {});
    if (!payload.telegramId && !payload.phone) {
      return res.status(400).json({ error: 'Телефон или Telegram ID обязательны' });
    }

    const query = payload.telegramId ? { telegramId: payload.telegramId } : { phone: payload.phone };
    const customer = await Customer.findOneAndUpdate(
      query,
      { $set: payload, $setOnInsert: query },
      { new: true, upsert: true }
    );

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', adminAuth, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ lastSeenAt: -1, createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
