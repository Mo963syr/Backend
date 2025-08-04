const express = require('express');
const router = express.Router();
const {addUser,viewsellerprands} = require('../controllers/user.Controller');

router.post('/add',addUser);
router.post('/viewsellerprands', viewsellerprands);

module.exports = router;