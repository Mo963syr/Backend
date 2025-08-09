const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.Controller');

// المسارات
router.post('/add', favoritesController.addFavorite);
router.post('/remove', favoritesController.removeFavorite);
router.get('/view/:userId', favoritesController.viewFavorites);

module.exports = router;
