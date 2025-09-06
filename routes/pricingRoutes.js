const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

router.get('/distance-price', pricingController.getDistanceAndPrice );

module.exports = router;
