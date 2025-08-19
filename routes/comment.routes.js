// routes/comment.routes.js
const express = require('express');
const router = express.Router();
const { addComment, getPartComments } = require('../controllers/comment.controller');

router.post('/comments', addComment);
router.get('/comments/:partId', getPartComments);

module.exports = router;
