const SpicificOrder = require('../models/spicificPartOrder.model');
const Part = require('../models/part.Model');
const User = require('../models/user.Model');
const Order = require('../models/order.model');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');

exports.ratePart = async (req, res) => {
  try {
    const { partId } = req.params;
    const { userId } = req.body;
    const rating = Number(req.body.rating);

    if (
      !mongoose.Types.ObjectId.isValid(partId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ success: false, message: 'معرف غير صالح' });
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: '⚠️ التقييم يجب أن يكون بين 1 و 5' });
    }

    const order = await Order.findOne({
      userId,
      status: 'تم التوصيل',
    }).populate({
      path: 'cartIds',
      select: 'partId',
      match: { partId: new mongoose.Types.ObjectId(partId) },
    });

    if (!order || !order.cartIds || order.cartIds.length === 0) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'لا يمكنك تقييم هذه القطعة قبل استلامها',
        });
    }

    const partDoc = await Part.findById(partId);
    if (!partDoc) {
      return res
        .status(404)
        .json({ success: false, message: 'القطعة غير موجودة' });
    }

    const already = (partDoc.ratings || []).some(
      (r) => r.user.toString() === userId
    );
    if (already) {
      return res
        .status(400)
        .json({ success: false, message: 'لقد قمت بتقييم هذه القطعة سابقًا' });
    }

    const ratings = [...(partDoc.ratings || []), { user: userId, rating }];
    const sum = ratings.reduce((a, r) => a + Number(r.rating || 0), 0);
    const avgRating = Number((sum / ratings.length).toFixed(2));
    const ratingsCount = ratings.length;

    await Part.updateOne(
      { _id: partId },
      {
        $push: { ratings: { user: userId, rating } },
        $set: { avgRating, ratingsCount },
      }
    );

    return res.status(200).json({
      success: true,
      message: '✅ تم حفظ التقييم بنجاح',
      data: { avgRating, ratingsCount },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};

exports.deletePart = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await part.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: '❌ القطعة غير موجودة' });
    }

    res.json({ message: '✅ تم حذف القطعة', part: deleted });
  } catch (err) {
    console.error('خطأ أثناء الحذف:', err);
    res.status(500).json({ message: '⚠️ خطأ في السيرفر' });
  }
};

exports.updatePart = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await part.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: '❌ القطعة غير موجودة' });
    }

    res.json({ message: '✅ تم تعديل القطعة', part: updated });
  } catch (err) {
    console.error('خطأ أثناء التعديل:', err);
    res.status(500).json({ message: '⚠️ خطأ في السيرفر' });
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
exports.CompatibleSpicificOrders = async (req, res) => {
  try {
    const { userid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userid)) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم غير صالح',
      });
    }

    const user = await User.findById(userid).select('prands role');

    // if (!user || !user.cars || user.cars.length === 0) {
    //   const part = await part.find();
    //   return res.status(200).json({
    //     success: true,
    //     parts: part,
    //     message: 'تم ارجاع كل السيارات',
    //   });
    // }
    console.log(user.role);
    console.log(user);
    if (user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'المستخدم ليس بائع',
      });
    }

    const compatibleParts = await spicificorder
      .find({
        $or: user.prands.map((prand) => ({
          manufacturer: prand,
        })),
      })
      .select(
        'name serialNumber manufacturer model year status price imageUrl notes '
      )
      .sort({ price: 1 });

    res.status(200).json({
      success: true,
      userprands: user.prands,
      compatibleParts: compatibleParts.map((prand) => ({
        id: prand._id,
        name: prand.name,
        serialNumber: prand.serialNumber,
        manufacturer: prand.manufacturer,
        model: prand.model,
        year: prand.year,
        notes: prand.notes,
        status: prand.status,
        price: prand.price,
        imageUrl: prand.imageUrl || '/default-part-image.jpg',
      })),
      meta: {
        totalorders: compatibleParts.length,
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
