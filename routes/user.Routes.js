const express = require('express');
const router = express.Router();

const {addUser,viewsellerprands } = require('../controllers/user.Controller');
const {register,login} = require('../controllers/auth.controller');

router.post('/add',addUser);
router.post('/register',register);
router.post('/login',login);
router.get('/viewsellerprands/:userId', viewsellerprands);

module.exports = router;