const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.get('/', async (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ error: 'Необходим номер телефона' });
  }

  try {
    const orders = await Order.find({ phone }).select('_id status totalAmount createdAt updatedAt delivery paymentStatus payment');
    res.json(orders.map(order => ({
      id: order._id.toString(),
      status: order.status,
      total: order.totalAmount,
      createdAt: order.createdAt?.toISOString?.() || null,
      updatedAt: order.updatedAt?.toISOString?.() || null,
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
