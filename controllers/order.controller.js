// controllers/orderController.js
const mongoose = require('mongoose');
const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
exports.addOrder = async (req, res) => {
  try {
    const { userId, coordinates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '⚠️ معرف المستخدم غير صالح',
      });
    }

    const existingOrder = await Order.findOne({ userId });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: '⚠️ تم بالفعل إنشاء طلب بهذه السلة من قبل',
      });
    }

    if (
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: '⚠️ الموقع الجغرافي غير صالح (يتطلب [lng, lat])',
      });
    }

    const userCartItems = await Cart.find({ userId });

    if (userCartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: '🚫 لا توجد منتجات في السلة لهذا المستخدم',
      });
    }

    const cartIds = userCartItems.map((item) => item._id);

    const newOrder = new Order({
      userId,
      cartIds,
      location: {
        type: 'Point',
        coordinates,
      },
    });

    await newOrder.save();

    await Cart.updateMany(
      { _id: { $in: cartIds } },
      { $set: { status: 'مؤكد' } }
    );

    res.status(201).json({
      success: true,
      message: '✅ تم إنشاء الطلب وتحديث حالة السلة بنجاح',
      order: newOrder,
    });
  } catch (error) {
    console.error('❌ خطأ في إنشاء الطلب:', error);
    res.status(500).json({
      success: false,
      message: '❌ فشل في إنشاء الطلب',
      error: error.message,
    });
  }
};

exports.vieworderitem = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '⚠️ معرف المستخدم غير صالح',
      });
    }

    const orders = await Order
      .find({ userId })
      .populate({
        path: 'cartIds',
        populate: {
          path: 'partId',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: '✅ تم تحميل الطلبات بنجاح',
      orders,
    });
  } catch (error) {
    console.error('حدث خطأ أثناء جلب الطلبات:', error);
    res.status(500).json({
      success: false,
      message: '❌ فشل في تحميل الطلبات',
      error: error.message,
    });
  }
};
exports.getOrdersForSeller = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    const orders = await Order.find() 
      .populate({
        path: 'cartIds',
        populate: {
          path: 'partId',
          match: { user: sellerId },
          select: 'name price user imageUrl',
        },
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const sellerItems = [];

    orders.forEach(order => {
      order.cartIds.forEach(item => {
        if (item.partId) {
          sellerItems.push({
            orderId: order._id,
            user: order.userId,
            part: item.partId,
            quantity: item.quantity,
            total: item.quantity * (item.partId.price || 0),
            createdAt: order.createdAt,
            status: order.status,
          });
        }
      });
    });

    const totalAmount = sellerItems.reduce((sum, item) => sum + item.total, 0);

    res.status(200).json({
      success: true,
      items: sellerItems,
      totalAmount,
    });
  } catch (error) {
    console.error('❌ Error fetching seller orders:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الطلبات الخاصة بالبائع',
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['قيد المعالجة', 'مؤكد', 'ملغي', 'على الطريق', 'تم التوصيل'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: '❌ حالة غير صالحة' });
    }

 
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: '❌ الطلب غير موجود' });
    }

 
    order.status = status;
    await order.save();

    await Cart.updateMany(
      { _id: { $in: order.cartIds } },
      { $set: { status } }
    );

    res.status(200).json({
      success: true,
      message: '✅ تم تحديث حالة الطلب وجميع عناصر السلة المرتبطة به',
      order,
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الحالة:', error);
    res.status(500).json({
      success: false,
      message: '❌ فشل في تحديث حالة الطلب',
      error: error.message,
    });
  }
};
