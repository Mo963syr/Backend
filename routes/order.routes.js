const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();
const {
  addOrder,
  vieworderitem,
  getOrdersForSeller,
  updateOrderStatus,viewspicificorderitem,getUserBrandOrders
} = require('../controllers/order.controller');

const { addspicificorder } = require('../controllers/part.Controller');
const { createOffer } = require('../controllers/recommendationOffer.Controller');

router.post('/addspicificorder', upload.single('image'), addspicificorder);
router.post('/create', addOrder);
router.get('/viewuserorder/:userId', vieworderitem);
router.get('/viewuserspicificorder/:userId', viewspicificorderitem);
router.get('/getUserBrandOrders/:userId', getUserBrandOrders);
router.get('/getOrderForSellrer/:sellerId', getOrdersForSeller);
router.put('/updateOrderStatus/:orderId', updateOrderStatus);
router.post('/recommendation-offer', /*authMiddleware,*/ createOffer);

module.exports = router;
