const Favorite = require('../models/Favorite.model');

// ✅ إضافة للمفضلة
exports.addFavorite = async (req, res) => {
  try {
    const { userId, partId } = req.body;

    if (!userId || !partId) {
      return res.status(400).json({ message: 'userId و partId مطلوبين' });
    }

    const favorite = new Favorite({ userId, partId });
    await favorite.save();

    res.status(200).json({ message: 'تمت الإضافة إلى المفضلة' });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: 'القطعة موجودة بالفعل في المفضلة' });
    }
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// ❌ إزالة من المفضلة
exports.removeFavorite = async (req, res) => {
  try {
    const { userId, partId } = req.body;

    if (!userId || !partId) {
      return res.status(400).json({ message: 'userId و partId مطلوبين' });
    }

    await Favorite.findOneAndDelete({ userId, partId });

    res.status(200).json({ message: 'تمت الإزالة من المفضلة' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// 📜 عرض المفضلة
exports.viewFavorites = async (req, res) => {
  try {
    const { userId } = req.params;

    const favorites = await Favorite.find({ userId })
      .populate('partId') // جلب بيانات القطعة كاملة
      .exec();

    res.status(200).json({
      favorites: favorites.map((fav) => fav.partId),
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};
