const mongoose = require('mongoose');

const recommendationOfferSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // معرف المورد
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'spicificorder', // معرف الطلب
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['متاح', 'غير متاح', 'قيد المراجعة'],
      default: 'متاح',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecommendationOffer', recommendationOfferSchema);
