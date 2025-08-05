const express = require('express');
const router = express.Router();
const modelsData = require('../data/models.json');


router.get('/', (req, res) => {
  const raw = req.query.brand;
  if (!raw) {
    return res
      .status(400)
      .json({ success: false, message: 'brand query required' });
  }

  const key = raw.toString().trim().toLowerCase();
  const list = modelsData[key];
  if (!list) {
    return res
      .status(404)
      .json({ success: false, message: `No models for brand "${raw}"` });
  }

  res.json({ success: true, models: list });
});

module.exports = router;
