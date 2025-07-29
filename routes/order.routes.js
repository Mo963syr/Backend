const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

router.post('/create', orderController.createOrder);
router.get('/seller/:sellerId', orderController.getOrdersForSeller);

module.exports = router;
