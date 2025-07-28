const cart = require('../models/cart.model');
const User = require('../models/user.Model');

const cloudinary = require('../utils/cloudinary');

const mongoose = require('mongoose');

exports.addPart = async (req, res) => {
  try {
    const { partId, userId } = req.body;
    const addCart = new cart({
      partId,
      userId,
    });
find= await  cart.findById
    await addCart.save();

    res.status(201).json({
      message: '✅ تم إضافة المنتج',
      cartproduct: addCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '❌ فشل في إضافة المنتج' });
  }
};
exports.viewcartitem = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'معرف المستخدم غير صالح' });
    }

    const cartItems = await cart.find({ userId })
      .populate('partId') 
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      cart: cartItems,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '❌ فشل في تحميل محتوى السلة' });
  }
};
