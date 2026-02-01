const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.get('/', async (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ error: 'Необходим номер телефона' });
  }

  try {
    const orders = await Order.find({ phone }).select(' _id status totalAmount createdAt delivery paymentStatus');
    res.json(orders.map(order => ({
      id: order._id.toString(),
      status: order.status,
      total: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      delivery: order.delivery,
      paymentStatus: order.paymentStatus
    })));
  } catch (err) {
    res.status(500).json({ error: 'Ошибка поиска заказов' });
  }
});

module.exports = router;