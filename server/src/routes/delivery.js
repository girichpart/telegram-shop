const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

router.post('/calculate', deliveryController.calculateDelivery);
router.get('/pvz', deliveryController.getPvzList);  // Для получения списка ПВЗ на карте

module.exports = router;