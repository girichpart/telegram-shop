const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

router.post('/calculate', deliveryController.calculateDelivery);
router.get('/pvz', deliveryController.getPvzList);
router.get('/cities', deliveryController.getCities);
router.post('/webhook', deliveryController.webhook);
router.get('/status', deliveryController.status);

module.exports = router;
