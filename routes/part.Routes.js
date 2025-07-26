const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { addPart, getCompatibleParts } = require('../controllers/part.Controller');

router.post('/add', upload.single('image'), addPart);
router.get('/viewPrivateParts',getCompatibleParts);


module.exports = router;
