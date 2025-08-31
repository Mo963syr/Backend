const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  deletePart,
  CompatibleSpicificOrders,
  updatePart,
  addPart,
  getCompatibleParts,
  viewAllParts,
  viewsellerParts,
  ratePart,
  getPartRatings,
} = require('../controllers/part.Controller');
router.delete('/delete/:id', deletePart);
router.put('/update/:id', updatePart);
router.post('/add', upload.single('image'), addPart);
router.post('/ratePart/:partId', ratePart);
router.get('/getPartRatings/:partId', getPartRatings);
router.get('/viewPrivateParts/:userid', getCompatibleParts);
router.get('/CompatibleSpicificOrders/:userid/:role', CompatibleSpicificOrders);
router.get('/viewAllParts', viewAllParts);
router.get('/viewsellerParts/:userId', viewsellerParts);

module.exports = router;
