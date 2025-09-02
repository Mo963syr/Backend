const mongoose = require('mongoose');

const partSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'يجب إدخال اسم القطعة'],
      trim: true,
      maxlength: [100, 'اسم القطعة لا يمكن أن يتجاوز 100 حرف'],
    },
    serialNumber: {
      type: String,
    },
    manufacturer: {
      type: String,
      required: [true, 'يجب إدخال اسم الصانع'],
    },
    model: {
      type: String,
      required: [true, 'يجب إدخال اسم الطراز أو السلسلة'],
      trim: true,
      maxlength: [50, 'اسم الطراز لا يمكن أن يتجاوز 50 حرف'],
    },
    count: {
      type: Number,
      required: [true, 'يجب إدخال عدد القطع '],
    },
    year: {
      type: Number,
      min: [2000, 'سنة الصنع يجب أن تكون 2000 أو أحدث'],
      max: [
        new Date().getFullYear(),
        `سنة الصنع يجب أن تكون ${new Date().getFullYear()} أو أقدم`,
      ],
      required: [true, 'يجب إدخال سنة الصنع'],
    },
    category: {
      type: String,
      enum: [
        'محرك',
        'هيكل',
        'فرامل',
        'كهرباء',
        'إطارات',
        'نظام التعليق',
        'تبريد',
      ],
      required: [true, 'يجب اختيار تصنيف القطعة'],
    },
    status: {
      type: String,
      enum: ['مستعمل', 'جديد'],
      default: 'جديد',
      required: [true, 'يجب اختيار حالة القطعة'],
    },
    price: {
      type: Number,
      min: [0, 'السعر يجب أن يكون قيمة موجبة'],
      required: [true, 'يجب إدخال سعر القطعة'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'الوصف لا يمكن أن يتجاوز 500 حرف'],
    },
    imageUrl: {
      type: String,
      required: false, // ✅ مو مطلوب إجباري
      validate: {
        validator: function (v) {
          // يقبل null أو فاضي أو رابط صحيح
          return !v || /^(https?:\/\/.+)$/.test(v);
        },
        message: (props) => `${props.value} ليس رابط صحيح للصورة!`,
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'يجب ربط القطعة بمعرف المستخدم'],
    },
    compatibleCars: [
      {
        make: String,
        model: String,
        years: {
          from: Number,
          to: Number,
        },
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

partSchema.index({ manufacturer: 1 });
partSchema.index({ model: 1 });
partSchema.index({ category: 1 });
partSchema.index({ status: 1 });
partSchema.index({ price: 1 });
partSchema.index({ user: 1 });

partSchema.virtual('age').get(function () {
  return new Date().getFullYear() - this.year;
});

partSchema.virtual('averageRating').get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const total = this.ratings.reduce((sum, r) => sum + r.rating, 0);
  return (total / this.ratings.length).toFixed(1);
});

module.exports = mongoose.model('Part', partSchema);
