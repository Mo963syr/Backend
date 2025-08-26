const express = require('express');
const router = express.Router();

const {
  listDeliveryOrders,
  acceptDeliveryOrder,
  startDeliveryOrder,
  completeDeliveryOrder,
  cancelDeliveryOrder,
} = require('../controllers/delivery.controller');

router.get('/orders', listDeliveryOrders);

router.put('/orders/:id/accept', acceptDeliveryOrder);

router.put('/orders/:id/start', startDeliveryOrder);

router.put('/orders/:id/complete', completeDeliveryOrder);
router.put('/orders/:id/cancel', cancelDeliveryOrder);
module.exports = router;
