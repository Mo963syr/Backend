const cart = require('../models/cart.model');
const User = require('../models/user.Model');
const Part = require('../models/part.Model');
const Order = require('../models/order.model');
const cloudinary = require('../utils/cloudinary');

const mongoose = require('mongoose');

exports.getCartItemsForSeller = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    const cartItems = await cart
      .find({ status: 'مؤكد' })
      .populate({
        path: 'partId',
        match: { user: sellerId },
        select: 'name price user imageUrl',
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const filtered = cartItems
      .filter((item) => item.partId)
      .map((item) => ({
        _id: item._id,
        user: item.userId,
        part: item.partId,
        quantity: item.quantity,
        total: item.quantity * (item.partId?.price || 0),
        createdAt: item.createdAt,
      }));

    const totalAmount = filtered.reduce((sum, item) => sum + item.total, 0);

    res.status(200).json({
      success: true,
      items: filtered,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل في جلب عناصر السلة الخاصة بالبائع',
      error: error.message,
    });
  }
};

exports.addPart = async (req, res) => {
  try {
    const { partId, userId, coordinates, paymentMethod, status } = req.body;

    const cartData = {
      partId,
      userId,
      paymentMethod,
      status,
    };

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      cartData.location = {
        type: 'Point',
        coordinates: coordinates,
      };
    }

    const addCart = new cart(cartData);
    await addCart.save();

    res.status(201).json({
      message: '✅ تم إضافة المنتج',
      cartproduct: addCart,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: '❌ فشل في إضافة المنتج', details: error.message });
  }
};

exports.viewcartitem = async (req, res) => {
  try {
    const { userId } = req.params;


    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '⚠️ معرف المستخدم غير صالح',
      });
    }

    const cartItems = await cart
      .find({ userId ,status:'قيد المعالجة' })
      .populate('partId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: '✅ تم تحميل عناصر السلة بنجاح',
      cart: cartItems,
    });
  } catch (error) {
    console.error('حدث خطأ أثناء جلب عناصر السلة:', error);
    res.status(500).json({
      success: false,
      message: '❌ فشل في تحميل محتوى السلة',
    });
  }
};
exports.updateCartStatus = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['قيد المعالجة', 'مؤكد', 'ملغي', 'على الطريق'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: '❌ حالة غير صالحة' });
    }

    const updated = await cart.findByIdAndUpdate(
      cartId,
      { status },
      { new: true }
    ).populate('partId userId');
  //  const updateOrder=await Order.findByIdAndUpdate(
  //     cartId,
  //     { status },
  //     { new: true }
  //   ).populate('partId userId');
    if (!updated) {
      return res.status(404).json({ success: false, message: '❌ لم يتم العثور على العنصر' });
    }

    res.status(200).json({
      success: true,
      message: '✅ تم تحديث حالة القطعة',
      updatedItem: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '❌ فشل في تحديث الحالة', error: error.message });
  }
};
