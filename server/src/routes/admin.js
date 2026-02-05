const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { login, password } = req.body;

  const adminLogin = process.env.ADMIN_LOGIN || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password required' });
  }

  if (login !== adminLogin || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { role: 'admin', login },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  res.json({ token });
});

router.get('/me', adminAuth, (req, res) => {
  res.json({ ok: true, admin: req.admin });
});

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

const extractChatId = (update) => {
  const chat =
    update?.message?.chat ||
    update?.edited_message?.chat ||
    update?.channel_post?.chat ||
    update?.my_chat_member?.chat ||
    update?.chat_member?.chat;
  return chat?.id || null;
};

router.get('/telegram/status', adminAuth, async (req, res) => {
  try {
    const me = await callTelegram('getMe');
    const updates = await callTelegram('getUpdates', { limit: 50, timeout: 0 });
    const lastUpdate = Array.isArray(updates.result) ? updates.result[updates.result.length - 1] : null;
    const lastChatId = extractChatId(lastUpdate);

    res.json({
      ok: true,
      bot: me.result || null,
      hasUpdates: Array.isArray(updates.result) && updates.result.length > 0,
      lastChatId,
      lastUpdate
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

router.get('/telegram/last-chat', adminAuth, async (req, res) => {
  try {
    const updates = await callTelegram('getUpdates', { limit: 50, timeout: 0 });
    const lastUpdate = Array.isArray(updates.result) ? updates.result[updates.result.length - 1] : null;
    const lastChatId = extractChatId(lastUpdate);

    if (!lastChatId) {
      return res.status(404).json({ error: 'Нет сообщений. Откройте бота и отправьте /start.' });
    }

    res.json({
      chatId: lastChatId,
      update: lastUpdate
    });
  } catch (err) {
    res.status(500).json({ error: err.code || err.message });
  }
});

module.exports = router;
