const express = require('express');
const router = express.Router();
const recommendationOfferController = require('../controllers/recommendationOffer.Controller');
// const { authMiddleware } = require('../middleware/auth'); // إذا عندك حماية JWT

// إضافة عرض جديد
router.post('/recommendation-offer', /*authMiddleware,*/ recommendationOfferController.createOffer);

module.exports = router;
