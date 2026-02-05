const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const adminAuth = require('../middlewares/adminAuth');
const { notifyOrder } = require('../utils/telegramNotify');

// Создать заказ
router.post('/', async (req, res) => {
  const { phone, email, products, delivery, telegram } = req.body;

  if (!phone || !email || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Неверные данные заказа' });
  }
  if (!telegram?.id) {
    return res.status(400).json({ error: 'Необходим Telegram ID' });
  }

  try {
    const productIds = products.map(p => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    const orderProducts = [];
    let totalAmount = 0;

    for (const item of products) {
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Некорректное количество товара' });
      }

      const dbProduct = dbProducts.find(p => p._id.toString() === item.productId.toString());
      if (!dbProduct) {
        return res.status(404).json({ error: 'Товар не найден' });
      }

      if (Array.isArray(dbProduct.sizes) && dbProduct.sizes.length > 0) {
        const sizeLabel = item.size;
        if (!sizeLabel) {
          return res.status(400).json({ error: 'Не выбран размер' });
        }
        const sizeEntry = dbProduct.sizes.find(s => s.label === sizeLabel);
        if (!sizeEntry || sizeEntry.stock < item.quantity) {
          return res.status(400).json({ error: `Недостаточно товара размера ${sizeLabel}` });
        }
      } else if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ error: 'Недостаточно товара на складе' });
      }

      orderProducts.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity,
        size: item.size || null
      });

      totalAmount += dbProduct.price * item.quantity;
    }

    // Обновляем остатки
    for (const item of products) {
      const dbProduct = dbProducts.find(p => p._id.toString() === item.productId.toString());
      if (dbProduct && Array.isArray(dbProduct.sizes) && dbProduct.sizes.length > 0) {
        const sizes = dbProduct.sizes.map(s => ({
          label: s.label,
          stock: s.stock
        }));
        const target = sizes.find(s => s.label === item.size);
        if (target) {
          target.stock = Math.max(0, target.stock - item.quantity);
        }
        const newStock = sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
        await Product.updateOne(
          { _id: item.productId },
          { $set: { sizes, stock: newStock } }
        );
      } else {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    const order = await Order.create({
      phone,
      email,
      telegram: telegram ? {
        id: telegram.id ? String(telegram.id) : undefined,
        username: telegram.username || '',
        firstName: telegram.firstName || '',
        lastName: telegram.lastName || ''
      } : undefined,
      products: orderProducts,
      totalAmount,
      paymentStatus: 'pending',
      status: 'new',
      payment: {
        provider: 'yookassa',
        status: 'pending'
      },
      delivery: {
        provider: 'cdek',
        type: 'pvz',
        address: delivery?.address || '',
        city: delivery?.city || '',
        pvz: delivery?.pvz || '',
        cost: delivery?.cost || 0,
        status: 'created'
      }
    });

    await notifyOrder(order, 'created');
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить все заказы (для админки)
router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить заказ по ID (публично, ограниченный набор)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
