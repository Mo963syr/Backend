

const express = require('express');
const router = express.Router();
const {getDashboardStats }= require('../controllers/admin.Controller');


router.get('/stats', getDashboardStats);

module.exports = router;
