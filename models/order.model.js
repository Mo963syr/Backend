// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cartIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true,
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (val) {
            return Array.isArray(val) && val.length === 2;
          },
          message: 'يجب تحديد إحداثيات صحيحة [lng, lat]',
        },
        required: false,
      },
    },
    status: {
      type: String,
      enum: ['قيد المعالجة', 'مؤكد', 'ملغي', 'على الطريق'],
      default: 'مؤكد',
    },
  },
  { timestamps: true }
);

orderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
