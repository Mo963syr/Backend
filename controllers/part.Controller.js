const part = require('../models/part.Model');
const User = require('../models/user.Model');
const cloudinary = require('../utils/cloudinary');

const mongoose = require('mongoose');

exports.deletePart = async (req, res) => {
  try {
    const { partId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(partId) || !partId) {
      return res.status(400).json({ error: '❌ معرف القطعة غير صالح' });
    }
    const deletedPart = await part.findByIdAndDelete(partId);

    if (!deletedPart) {
      return res.status(404).json({ error: '❌ لم يتم العثور على القطعة' });
    }

    res.status(200).json({
      message: '✅ تم حذف القطعة بنجاح',
      deletedPart: deletedPart,
    });
  } catch (error) {
    console.error('❌ خطأ أثناء حذف القطعة:', error);
    res.status(500).json({ error: 'فشل في حذف القطعة بسبب خطأ داخلي' });
  }
};

exports.getCompatibleParts = async (req, res) => {
  try {
    const { userId } = req.body;

    // التحقق من صحة معرف المستخدم
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم غير صالح',
      });
    }

    // جلب سيارات المستخدم
    const user = await User.findById(userId)
      .select('cars')
      .populate('cars', 'manufacturer model year');

    if (!user || !user.cars || user.cars.length === 0) {
      return res.status(200).json({
        success: true,
        parts: [],
        message: 'لا توجد سيارات مسجلة لهذا المستخدم',
      });
    }

    // فلترة القطع حسب الماركة والموديل والسنة فقط
    const compatibleParts = await part
      .find({
        $or: user.cars.map((car) => ({
          manufacturer: car.manufacturer,
          model: car.model,
          year: car.year,
        })),
      })
      .select('name manufacturer model year category status price imageUrl')
      .sort({ price: 1 });

    res.status(200).json({
      success: true,
      userCars: user.cars,
      compatibleParts: compatibleParts.map((part) => ({
        id: part._id,
        name: part.name,
        manufacturer: part.manufacturer,
        model: part.model,
        year: part.year,
        category: part.category,
        status: part.status,
        price: part.price,
        imageUrl: part.imageUrl || '/default-part-image.jpg',
      })),
      meta: {
        totalParts: compatibleParts.length,
      },
    });
  } catch (error) {
    console.error('حدث خطأ في جلب القطع المتوافقة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
exports.viewPrivateParts = async (req, res) => {
  try {
    const { userid, category } = req.body;

    let parts;

    if (!userid || userid.trim() === '') {
      parts = await part.find();
    } else if (userid != null) {
      parts = await part.find({ user: userid });
    } else if (category) {
      parts = await part.find({ category: category });
    }

    res.status(200).json({
      message: '✅ تم جلب القطع بنجاح',
      parts: parts,
    });
  } catch (error) {
    console.error('❌ خطأ أثناء جلب القطع:', error);
    res.status(500).json({ error: 'فشل في جلب القطع' });
  }
};

exports.addPart = async (req, res) => {
  try {
    const { name, manufacturer, model, year, category, status, user, price } =
      req.body;
    let imageUrl = req.file ? req.file.path : null; // Changed from const to let

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url; // Now this works because imageUrl is let
    }

    const newPart = new part({
      name,
      manufacturer,
      model,
      year,
      category,
      status,
      user,
      imageUrl,
      price,
    });

    await newPart.save();

    res.status(201).json({
      message: '✅ تم إضافة المنتج',
      part: newPart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '❌ فشل في إضافة المنتج' });
  }
};
