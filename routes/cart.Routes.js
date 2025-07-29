const express = require('express');
const router = express.Router();

const { addPart, viewcartitem , getCartItemsForSeller} = require('../controllers/cart.Controller');

router.post('/addToCart', addPart);
router.get('/viewcartitem/:userId', viewcartitem);
router.get('/getCartItemsForSeller/:sellerId', getCartItemsForSeller);

module.exports = router;
