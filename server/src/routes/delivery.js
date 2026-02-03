const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

router.post('/calculate', deliveryController.calculateDelivery);
router.get('/pvz', deliveryController.getPvzList);
router.post('/webhook', deliveryController.webhook);

module.exports = router;
