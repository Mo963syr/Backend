const part = require('../models/part.Model');
const User = require('../models/user.Model');
const spicificorder = require('../models/spicificPartOrder.model');
const cloudinary = require('../utils/cloudinary');

const mongoose = require('mongoose');



exports.deletePart = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await part.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "❌ القطعة غير موجودة" });
    }

    res.json({ message: "✅ تم حذف القطعة", part: deleted });
  } catch (err) {
    console.error("خطأ أثناء الحذف:", err);
    res.status(500).json({ message: "⚠️ خطأ في السيرفر" });
  }
};


exports.updatePart = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await part.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "❌ القطعة غير موجودة" });
    }

    res.json({ message: "✅ تم تعديل القطعة", part: updated });
  } catch (err) {
    console.error("خطأ أثناء التعديل:", err);
    res.status(500).json({ message: "⚠️ خطأ في السيرفر" });
  }
};


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
    const { userid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userid)) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم غير صالح',
      });
    }

    const user = await User.findById(userid)
      .select('cars')
      .populate('cars', 'manufacturer model year');

    if (!user || !user.cars || user.cars.length === 0) {
      const part = await part.find();
      return res.status(200).json({
        success: true,
        parts: part,
        message: 'تم ارجاع كل السيارات',
      });
    }


    const compatibleParts = await part
      .find({
        $or: user.cars.map((car) => ({
          manufacturer: car.manufacturer,
          model: car.model,
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
exports.viewAllParts = async (req, res) => {
  try {
    let parts;
    parts = await part.find();

    res.status(200).json({
      message: '✅ تم جلب القطع بنجاح',
      compatibleParts: parts,
    });
  } catch (error) {
    console.error('❌ خطأ أثناء جلب القطع:', error);
    res.status(500).json({ error: 'فشل في جلب القطع' });
  }
};
exports.viewsellerParts = async (req, res) => {
  try {
    const { userId } = req.params;

    const parts = await part.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      parts,
    });
  } catch (error) {
    console.error('❌ خطأ أثناء جلب القطع:', error);
    res.status(500).json({ error: 'فشل في جلب القطع' });
  }
};

exports.addPart = async (req, res) => {
  try {
    const {
      name,
      manufacturer,
      model,
      year,
      category,
      status,
      user,
      price,
      serialNumber,
      description,
    } = req.body;
    //     const users=await User.findById(user);

    //     if(!users){
    //  return res.status(404).json({
    //     success: false,
    //     message: '🚫 المستخدم غير موجود في قاعدة البيانات',
    //   });
    //     }
    let imageUrl = req.file ? req.file.path : null; // Changed from const to let

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url; // Now this works because imageUrl is let
    }

    const newPart = new part({
      name,
      manufacturer,
      serialNumber,
      model,
      year,
      category,
      status,
      user,
      imageUrl,
      price,
      description,
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

exports.addspicificorder = async (req, res) => {
  try {
    const {
      name,
      manufacturer,
      model,
      year,
      status,
      user,
      serialNumber,
      notes,
    } = req.body;
    //     const users=await User.findById(user);

    //     if(!users){
    //  return res.status(404).json({
    //     success: false,
    //     message: '🚫 المستخدم غير موجود في قاعدة البيانات',
    //   });
    //     }
    let imageUrl = req.file ? req.file.path : null; // Changed from const to let

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url; // Now this works because imageUrl is let
    }

    const newPart = new spicificorder({
      name,
      manufacturer,
      serialNumber,
      model,
      year,
      status,
      user,
      imageUrl,
      notes,
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
