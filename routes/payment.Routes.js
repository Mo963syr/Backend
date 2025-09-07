// routes/payment.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/init', paymentController.initPayment);
router.get('/callback/:orderId', paymentController.paymentCallback);
router.post('/trigger/:orderId', paymentController.paymentTrigger);
module.exports = router;
