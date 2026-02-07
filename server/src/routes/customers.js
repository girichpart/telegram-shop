const express = require('express');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { sendMessage } = require('../utils/telegramNotify');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();

const buildPayload = (payload) => {
  const telegram = payload?.telegram || {};
  const phone = payload?.phone || '';
  const data = {
    phone,
    lastSeenAt: new Date()
  };
  if (telegram.id) data.telegramId = String(telegram.id);
  if (telegram.username) data.telegramUsername = telegram.username;
  if (telegram.firstName || telegram.first_name) data.firstName = telegram.firstName || telegram.first_name;
  if (telegram.lastName || telegram.last_name) data.lastName = telegram.lastName || telegram.last_name;
  return data;
};

const stripUndefined = (payload) => {
  const out = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (typeof value === 'string' && value.trim() === '' && key !== 'phone') return;
    out[key] = value;
  });
  return out;
};

router.post('/', async (req, res) => {
  try {
    const payload = stripUndefined(buildPayload(req.body || {}));
    const notify = req.body?.notify === true;
    if (!payload.telegramId && !payload.phone) {
      return res.status(400).json({ error: 'Телефон или Telegram ID обязательны' });
    }

    const query = payload.telegramId ? { telegramId: payload.telegramId } : { phone: payload.phone };
    const customer = await Customer.findOneAndUpdate(
      query,
      { $set: payload, $setOnInsert: query },
      { new: true, upsert: true }
    );

    if (notify && customer?.telegramId && customer?.phone) {
      await sendMessage(customer.telegramId, `Номер подтвержден: ${customer.phone}`);
    }

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clear-phone', async (req, res) => {
  try {
    const telegramId = req.body?.telegramId ? String(req.body.telegramId) : '';
    const phone = req.body?.phone || '';
    if (!telegramId && !phone) {
      return res.status(400).json({ error: 'Телефон или Telegram ID обязательны' });
    }

    const query = telegramId ? { telegramId } : { phone };
    const customer = await Customer.findOneAndUpdate(
      query,
      { $set: { phone: '', lastSeenAt: new Date() } },
      { new: true }
    );

    res.json({ ok: true, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/public', async (req, res) => {
  try {
    const telegramId = req.query?.telegramId ? String(req.query.telegramId) : '';
    const phone = req.query?.phone || '';
    if (!telegramId && !phone) {
      return res.status(400).json({ error: 'Телефон или Telegram ID обязательны' });
    }

    let customer = null;
    if (telegramId) {
      customer = await Customer.findOne({ telegramId }).lean();
    } else if (phone) {
      customer = await Customer.findOne({ phone }).lean();
    }

    if (!customer && telegramId) {
      const order = await Order.findOne({ 'telegram.id': telegramId }).sort({ createdAt: -1 }).lean();
      if (order) {
        return res.json({
          phone: order.phone || '',
          telegramId,
          telegramUsername: order.telegram?.username || '',
          firstName: order.telegram?.firstName || '',
          lastName: order.telegram?.lastName || ''
        });
      }
    }

    if (!customer) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    res.json({
      phone: customer.phone || '',
      telegramId: customer.telegramId || '',
      telegramUsername: customer.telegramUsername || '',
      firstName: customer.firstName || '',
      lastName: customer.lastName || ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', adminAuth, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ lastSeenAt: -1, createdAt: -1 }).lean();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    const map = new Map();

    customers.forEach(customer => {
      const key = customer.telegramId || customer.phone;
      if (!key) return;
      map.set(key, { ...customer, totalOrders: 0, totalAmount: 0 });
    });

    orders.forEach(order => {
      const key = order.telegram?.id || order.phone;
      if (!key) return;
      const existing = map.get(key) || {
        _id: undefined,
        telegramId: order.telegram?.id ? String(order.telegram.id) : undefined,
        telegramUsername: order.telegram?.username || '',
        firstName: order.telegram?.firstName || '',
        lastName: order.telegram?.lastName || '',
        phone: order.phone || '',
        lastSeenAt: order.createdAt,
        totalOrders: 0,
        totalAmount: 0
      };
      existing.totalOrders += 1;
      existing.totalAmount += order.totalAmount || 0;
      if (!existing.lastSeenAt || order.createdAt > existing.lastSeenAt) {
        existing.lastSeenAt = order.createdAt;
      }
      map.set(key, existing);
    });

    res.json(Array.from(map.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
