const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.get('/', async (req, res) => {
  const { telegramId } = req.query;
  if (!telegramId) {
    return res.status(400).json({ error: 'Необходим Telegram ID' });
  }

  try {
    const orders = await Order.find({ 'telegram.id': String(telegramId) })
      .select('_id status totalAmount createdAt updatedAt delivery paymentStatus payment telegram phone products');
    res.json(orders.map(order => ({
      id: order._id.toString(),
      status: order.status,
      total: order.totalAmount,
      createdAt: order.createdAt?.toISOString?.() || null,
      updatedAt: order.updatedAt?.toISOString?.() || null,
      phone: order.phone,
      telegram: order.telegram || null,
      products: order.products || [],
      delivery: order.delivery,
      deliveryStatus: order.delivery?.status || 'created',
      trackingNumber: order.delivery?.trackingNumber || null,
      paymentStatus: order.paymentStatus || order.payment?.status || 'pending'
    })));
  } catch (err) {
    res.status(500).json({ error: 'Ошибка поиска заказов' });
  }
});

module.exports = router;
