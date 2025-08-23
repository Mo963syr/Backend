const mongoose = require('mongoose');

const orderSummarySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'spicificorderschema',
      required: true,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecommendationOffer',
    },
     status: {
          type: String,
      enum: ['بانتظار تأكيدك', 'قيد البحث','قيد المعالجة', 'ملغي', 'على الطريق','تم التوصيل' ,'مؤكد'],
      default: 'قيد المعالجة',
    }, 
    appliedPrice: Number,
    appliedDescription: String,
    appliedImages: [String], 
  },

  { timestamps: true }
);

module.exports = mongoose.model('OrderSummary', orderSummarySchema);
