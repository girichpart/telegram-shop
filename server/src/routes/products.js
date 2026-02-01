const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Получить все товары (для клиента)
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Создать товар (админ)
router.post('/', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

module.exports = router;