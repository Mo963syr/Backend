const express = require('express');
const router = express.Router();
const {addUser,viewsellerprands} = require('../controllers/user.Controller');

router.post('/add',addUser);
router.get('/viewsellerprands/:userId', viewsellerprands);

module.exports = router;