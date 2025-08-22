const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Part',
    },
    spicificorderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'spicificorderschema',
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
      enum: ['قيد المعالجة', 'مؤكد', 'ملغي', 'على الطريق', 'قيد التجهيز'],
      default: 'قيد المعالجة',
    },
    // paymentMethod: {
    //   type: String,
    //   enum: ['عند الاستلام', 'بطاقة إلكترونية'],
    //   default: 'عند الاستلام',
    // },
    // location: {
    //   type: {
    //     type: String,
    //     enum: ['Point'],
    //     default: 'Point'
    //   },
    //   coordinates: {
    //     type: [Number],
    //     validate: {
    //       validator: function(val) {
    //         return Array.isArray(val) && val.length === 2;
    //       },
    //       message: 'يجب تحديد إحداثيات صحيحة [lng, lat]'
    //     },
    //     required: false
    //   }
    // }
  },
  { timestamps: true }
);

cartSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Cart', cartSchema);
