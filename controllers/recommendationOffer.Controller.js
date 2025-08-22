const RecommendationOffer = require('../models/RecommendationOffer.model');

exports.createOffer = async (req, res) => {
  try {
    const { orderId, price, imageUrl, description, sellerId } = req.body;

    if (!orderId || !price) {
      return res
        .status(400)
        .json({ success: false, message: '⚠️ البيانات غير مكتملة' });
    }

    const offer = new RecommendationOffer({
      seller: sellerId,
      order: orderId,
      price,
      imageUrl,
      description,
    });

    await offer.save();

    res.status(201).json({
      success: true,
      message: '✅ تم إضافة العرض بنجاح',
      offer,
    });
  } catch (err) {
    console.error('❌ خطأ أثناء إضافة العرض:', err);
    res
      .status(500)
      .json({
        success: false,
        message: 'فشل في إضافة العرض',
        error: err.message,
      });
  }
};

exports.getOffersByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const offers = await RecommendationOffer.find({ order: orderId })
      .populate('seller', 'name phone email')
      .populate('order');

    res.status(200).json({
      success: true,
      total: offers.length,
      offers,
    });
  } catch (err) {
    console.error('❌ خطأ أثناء جلب العروض:', err);
    res
      .status(500)
      .json({
        success: false,
        message: 'فشل في جلب العروض',
        error: err.message,
      });
  }
};
