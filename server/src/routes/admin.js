const express = require('express');
const jwt = require('jsonwebtoken');
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

module.exports = router;
