const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        partId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Part',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['قيد التنفيذ', 'مؤكد', 'ملغي', 'تم التوصيل'],
          default: 'قيد التنفيذ',
        }
      }
    ],
    paymentMethod: {
      type: String,
      enum: ['عند الاستلام', 'بطاقة إلكترونية'],
      required: true,
    },
    address: String,
    mapLink: String,
    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
      }
    }
  },
  { timestamps: true }
);

orderSchema.index({ deliveryLocation: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);