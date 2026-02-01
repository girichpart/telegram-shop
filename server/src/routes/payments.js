const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create', paymentController.createPayment);
router.post('/webhook', paymentController.webhook);  // Для уведомлений от ЮKassa

module.exports = router;