const express = require('express');
const router = express.Router();
const {
  addOrder,
  vieworderitem,
  getOrdersForSeller,
  updateOrderStatus,
} = require('../controllers/order.controller');

router.post('/create', addOrder);
router.get('/viewuserorder/:userId', vieworderitem);
router.get('/getOrderForSellrer/:sellerId', getOrdersForSeller);
router.put('/updateOrderStatus/:orderId', updateOrderStatus);

module.exports = router;
