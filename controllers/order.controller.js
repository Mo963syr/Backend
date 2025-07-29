const Order = require('../models/order.model');
const Cart = require('../models/cart.model');

exports.createOrder = async (req, res) => {
  try {
    const { userId, paymentMethod, address, mapLink, deliveryLocation } = req.body;

    const cartItems = await Cart.find({ userId }).populate('partId');

    if (!cartItems.length) {
      return res.status(400).json({ message: 'السلة فارغة' });
    }

    const items = cartItems.map(item => ({
      partId: item.partId._id,
      quantity: item.quantity,
      sellerId: item.partId.user, 
    }));

    const order = await Order.create({
      userId,
      items,
      paymentMethod,
      address,
      mapLink,
      deliveryLocation,
    });

 
    await Cart.deleteMany({ userId });

    res.status(201).json({
      success: true,
      message: '✅ تم إنشاء الطلب بنجاح',
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '❌ فشل في إنشاء الطلب',
      error: error.message,
    });
  }
};

exports.getOrdersForSeller = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    const orders = await Order.find({
      'items.sellerId': sellerId,
    }).populate('items.partId');

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: 'فشل في جلب الطلبات',
      error,
    });
  }
};
