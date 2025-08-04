const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  addPart,
  getCompatibleParts,
  viewAllParts,viewsellerParts
} = require('../controllers/part.Controller');

router.post('/add', upload.single('image'), addPart);
router.get('/viewPrivateParts/:userid', getCompatibleParts);
router.get('/viewAllParts', viewAllParts);
router.get('/viewsellerParts/:userId', viewsellerParts);

module.exports = router;
