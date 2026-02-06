const express = require('express');
const axios = require('axios');
const Customer = require('../models/Customer');

const router = express.Router();

const getTelegramToken = () => process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

const callTelegram = async (method, params = {}) => {
  const token = getTelegramToken();
  if (!token) {
    const error = new Error('Telegram token missing');
    error.code = 'TOKEN_MISSING';
    throw error;
  }
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await axios.get(url, { params });
  return response.data;
};

const extractContactFromUpdate = (update) => {
  const message = update?.message || update?.edited_message;
  const contact = message?.contact;
  const from = message?.from || message?.chat;
  return {
    contact,
    from
  };
};

router.post('/contact', async (req, res) => {
  try {
    const telegramId = req.body?.telegramId ? String(req.body.telegramId) : '';
    if (!telegramId) {
      return res.status(400).json({ error: 'Необходим telegramId' });
    }

    const updates = await callTelegram('getUpdates', { limit: 100, timeout: 0 });
    const list = Array.isArray(updates.result) ? updates.result : [];
    let matched = null;

    for (let i = list.length - 1; i >= 0; i -= 1) {
      const { contact, from } = extractContactFromUpdate(list[i]);
      if (!from?.id) continue;
      if (String(from.id) !== telegramId) continue;
      if (!contact?.phone_number) continue;
      matched = { contact, from };
      break;
    }

    if (!matched) {
      return res.status(404).json({ error: 'Контакт не найден' });
    }

    const payload = {
      telegramId,
      telegramUsername: matched.from?.username || '',
      firstName: matched.from?.first_name || matched.contact?.first_name || '',
      lastName: matched.from?.last_name || matched.contact?.last_name || '',
      phone: matched.contact?.phone_number || '',
      lastSeenAt: new Date()
    };

    const customer = await Customer.findOneAndUpdate(
      { telegramId },
      { $set: payload, $setOnInsert: { telegramId } },
      { new: true, upsert: true }
    );

    res.json({ ok: true, phone: customer.phone || '', customer });
  } catch (err) {
    res.status(500).json({ error: err.code || err.message });
  }
});

module.exports = router;
