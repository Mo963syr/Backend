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
  status: {
    type: String,
    enum: ['قيد المعالجة', 'مؤكد', 'ملغي'],
    default: 'قيد المعالجة',
  },
  paymentMethod: {
    type: String,
    enum: ['عند الاستلام', 'بطاقة إلكترونية'],
    default: 'عند الاستلام',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: undefined
    }
  }
}, { timestamps: true });

cartSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Cart', cartSchema);
