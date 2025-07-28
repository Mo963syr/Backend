const express = require('express');
const router = express.Router();

const {
addPart
} = require('../controllers/cart.Controller');


router.post('/addToCart', addPart);

module.exports = router;
