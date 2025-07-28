const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  partId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: [true, 'يجب ربط القطعة'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'يجب ربط المستخدم'],
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
