const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const adminAuth = require('../middlewares/adminAuth');

const sampleProducts = [
  {
    name: 'Vortex-01 System Shell',
    category: 'Outerwear / Tech',
    description: '3-layer technical shell built for volatile urban conditions.',
    images: [
      'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    name: 'Terrain Shoe 01',
    category: 'Footwear / Vibram',
    description: 'Rugged low-profile outsole with waterproof upper.',
    images: [
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    name: 'X-Pac Sling Bag',
    category: 'Carry / Waterproof',
    description: 'Lightweight technical sling with waterproof X-Pac fabric.',
    images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'
    ]
  }
];

// Получить все
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать (для админки)
router.post('/', adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавить тестовый товар
router.post('/seed', adminAuth, async (req, res) => {
  try {
    const pick = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const price = Math.floor(12000 + Math.random() * 38000);

    const product = await Product.create({
      name: pick.name,
      price,
      description: pick.description,
      category: pick.category,
      images: pick.images,
      stock: Math.floor(2 + Math.random() * 10)
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить один по ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить (для админки)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить (для админки)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
