const express = require('express');
const router = express.Router();
const {createOffer,getOffersByOrder,applyOfferToOrder} = require('../controllers/recommendationOffer.Controller');


router.post('/recommendation-offer',  createOffer);
router.get('/recommendation-offer/:orderId', /*authMiddleware,*/ getOffersByOrder);
router.post('/apply-offer', /*authMiddleware,*/ applyOfferToOrder);

module.exports = router;
