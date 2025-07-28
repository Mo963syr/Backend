const express = require('express');
const router = express.Router();

const { addPart, viewcartitem } = require('../controllers/cart.Controller');

router.post('/addToCart', addPart);
router.get('/viewcartitem/:userId', viewcartitem);

module.exports = router;
