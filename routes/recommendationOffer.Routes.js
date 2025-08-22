const express = require('express');
const router = express.Router();
const {createOffer,getOffersByOrder} = require('../controllers/recommendationOffer.Controller');


router.post('/recommendation-offer',  createOffer);
router.get('/recommendation-offer/:orderId', /*authMiddleware,*/ getOffersByOrder);
module.exports = router;
