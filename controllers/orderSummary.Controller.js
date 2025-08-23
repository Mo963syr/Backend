// controllers/orderSummaryController.js
const OrderSummary = require('../models/orderSummary.model');
const SpicificOrder = require('../models/spicificPartOrder.model');
const mongoose = require('mongoose');
exports.getOrderSummariesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '⚠️ معرف المستخدم غير صالح',
      });
    }

    // نجيب الطلبات الخاصة بالمستخدم
    const userOrders = await SpicificOrder.find({ user: userId }).select('_id');

    if (!userOrders.length) {
      return res.status(200).json({
        success: true,
        message: '🔎 لا يوجد طلبات للمستخدم',
        items: [],
      });
    }

    const orderIds = userOrders.map(o => o._id);

    // نجيب OrderSummary المرتبطة بمعرفات الطلبات
    const summaries = await OrderSummary.find({ order: { $in: orderIds } })
      .populate('order')
      .populate({
        path: 'offer',
        populate: { path: 'seller', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    // 🔹 Normalize (تسطيح البيانات)
    const normalized = summaries.map(item => ({
      // بيانات الطلب
      name: item.order?.name || "",
      manufacturer: item.order?.manufacturer || "",
      model: item.order?.model || "",
      year: item.order?.year || null,
      category: item.order?.category || "",
      status: item.status || item.order?.status || "",
      price: item.appliedPrice || 0,
      imageUrl: (item.appliedImages && item.appliedImages.length > 0) ? item.appliedImages[0] : "",
      user: item.order?.user || userId,

      // بيانات العرض بنفس المستوى
      offerId: item.offer?._id || null,
      offerPrice: item.offer?.price || 0,
      offerDescription: item.offer?.description || "",
      offerImageUrl: item.offer?.imageUrl || "",
      offerStatus: item.offer?.status || "",
      sellerId: item.offer?.seller?._id || null,
      sellerName: item.offer?.seller?.name || "",
      sellerEmail: item.offer?.seller?.email || "",
    }));

    res.status(200).json({
      success: true,
      message: '✅ تم تحميل الملخصات بنجاح',
      items: normalized,
    });
  } catch (error) {
    console.error('❌ خطأ أثناء جلب OrderSummary:', error);
    res.status(500).json({
      success: false,
      message: '⚠️ فشل في تحميل البيانات',
      error: error.message,
    });
  }
};

