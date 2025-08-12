// controllers/orderController.js
const mongoose = require('mongoose');
const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const User = require('../models/user.Model');
const SpicificOrder = require('../models/spicificPartOrder.model');

exports.getUserBrandOrders = async (req, res) => {
  try {
    const { userId } = req.params;

   
    const user = await User.findById(userId).select('prands name phoneNumber');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    const brands = Array.isArray(user.prands) ? user.prands : [];
    if (brands.length === 0) return res.json([]);

    const orders = await SpicificOrder.find({
      manufacturer: { $in: brands },
    }).lean();

    const ordersWithUser = orders.map((order) => ({
      ...order,
      userId: user._id,
      userName: user.name,
      phoneNumber: user.phoneNumber,
    }));

    res.json(ordersWithUser);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
};

exports.addOrder = async (req, res) => {
  try {
    const { userId, coordinates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '⚠️ معرف المستخدم غير صالح',
      });
    }

    const existingOrder = await Order.find({
      userId,
      status: { $ne: 'تم التوصيل' },
    });
    if (existingOrder.length >= 3) {
      return res.status(400).json({
        success: false,
        message: '⚠️ لا يمكن إنشاء أكثر من 3 طلبات غير مكتملة',
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

    const userCartItems = await Cart.find({ userId, status: 'قيد المعالجة' });

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

    const orders = await Order.find({ userId })
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

exports.viewspicificorderitem = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '⚠️ معرف المستخدم غير صالح',
      });
    }

    const orders = await spicificOrder.find({ user: userId });

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
          select: 'name price user imageUrl location',
        },
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const filteredOrders = orders
      .map((order) => {
        const sellerParts = order.cartIds.filter((item) => item.partId);
        if (sellerParts.length > 0) {
          return {
            orderId: order._id,
            customer: order.userId,
            status: order.status,
            createdAt: order.createdAt,
            items: sellerParts.map((item) => ({
              partId: item.partId._id,
              name: item.partId.name,
              price: item.partId.price,
              quantity: item.quantity,
              total: item.quantity * (item.partId.price || 0),
              imageUrl: item.partId.imageUrl,
              location: item.partId.location,
            })),
            totalAmount: sellerParts.reduce(
              (sum, item) => sum + item.quantity * (item.partId.price || 0),
              0
            ),
          };
        }
        return null;
      })
      .filter((order) => order !== null);

    res.status(200).json({
      success: true,
      orders: filteredOrders,
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

    const allowedStatuses = [
      'قيد التجهيز',
      'مؤكد',
      'ملغي',
      'على الطريق',
      'تم التوصيل',
    ];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: '❌ حالة غير صالحة' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: '❌ الطلب غير موجود' });
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
