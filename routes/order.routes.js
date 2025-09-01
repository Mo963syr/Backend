const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();
const {
  addOrder,
  vieworderitem,
  getOrdersForSeller,
  updateOrderStatus,
  viewspicificorderitem,
  getUserBrandOrders,
  viewspicificordercompleted,getOrdersWithAverageRatings
} = require('../controllers/order.controller');

const { addspicificorder } = require('../controllers/part.Controller');
const {
  getOrderSummariesByUser
} = require('../controllers/orderSummary.Controller');
// const { createOffer ,getOffersByOrder } = require('../controllers/recommendationOffer.Controller');
router.post('/addspicificorder', upload.single('image'), addspicificorder);
router.post('/create', addOrder);
router.get('/viewuserorder/:userId', vieworderitem);
router.get('/viewuserspicificorder/:userId', viewspicificorderitem);
router.get('/getUserBrandOrders/:userId', getUserBrandOrders);
router.get('/getOrderForSellrer/:sellerId', getOrdersForSeller);
router.put('/updateOrderStatus/:orderId', updateOrderStatus);
router.get('/order-summary/:userId', getOrderSummariesByUser);
router.get('/viewspicificordercompleted/:userId', viewspicificordercompleted);
router.get('/getOrdersWithAverageRatings', getOrdersWithAverageRatings);
// router.post('/recommendation-offer', /*authMiddleware,*/ createOffer);

module.exports = router;
