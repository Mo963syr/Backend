const express = require('express');
const router = express.Router();

const {addUser,viewsellerprands } = require('../controllers/user.Controller');
const {register} = require('../controllers/auth.controller');

router.post('/add',addUser);
router.post('/register',register);
router.get('/viewsellerprands/:userId', viewsellerprands);

module.exports = router;