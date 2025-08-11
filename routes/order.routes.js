const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();
const {
  addOrder,
  vieworderitem,
  getOrdersForSeller,
  updateOrderStatus,
} = require('../controllers/order.controller');

const { addspicificorder } = require('../controllers/part.Controller');

router.post('/addspicificorder', upload.single('image'), addspicificorder);
router.post('/create', addOrder);
router.get('/viewuserorder/:userId', vieworderitem);
router.get('/getOrderForSellrer/:sellerId', getOrdersForSeller);
router.put('/updateOrderStatus/:orderId', updateOrderStatus);

module.exports = router;
