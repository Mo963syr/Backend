const mongoose = require('mongoose');
const Order = require('../models/order.model');
const User = require('../models/user.Model');

const normalizeProvince = (s) => (s ?? '').toString().trim().toLowerCase();

const STATUS = {
  CONFIRMED: 'مؤكد',
  RECEIVED: 'مستلمة',
  ON_ROAD: 'على الطريق',
  DELIVERED: 'تم التوصيل',
  CANCELED: 'ملغي',
};

// GET /delivery/orders
exports.listDeliveryOrders = async (req, res) => {
  try {
    const { status = STATUS.CONFIRMED, driverId } = req.query;
    if (!driverId) return res.status(400).json({ success: false, message: 'driverId مفقود' });
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ success: false, message: 'driverId غير صالح' });
    }

    const driver = await User.findById(driverId).select('role province provinceNorm');
    if (!driver || driver.role !== 'delevery') {
      return res.status(403).json({ success: false, message: 'المستخدم ليس موظف توصيل' });
    }

    const driverProvNorm = normalizeProvince(driver.provinceNorm || driver.province);
    if (!driverProvNorm) {
      return res.status(400).json({ success: false, message: 'محافظة المندوب غير محددة' });
    }

    const baseMatch =
      status === STATUS.CONFIRMED
        ? { status: STATUS.CONFIRMED, $or: [{ 'delivery.driverId': null }, { 'delivery.driverId': { $exists: false } }] }
        : { status: status, 'delivery.driverId': driver._id };

    const provinceMatch = { 'delivery.provinceNorm': driverProvNorm };

    const orders = await Order.find({ ...baseMatch, ...provinceMatch })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, orders });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};

// PUT /delivery/orders/:id/accept
exports.acceptDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId, fee } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ success: false, message: 'معرف غير صالح' });
    }
    if (typeof fee !== 'number' || fee <= 0) {
      return res.status(400).json({ success: false, message: 'سعر التوصيل غير صالح' });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    if (order.status !== STATUS.CONFIRMED) {
      return res.status(409).json({ success: false, message: 'لا يمكن قبول طلب غير مؤكد' });
    }

    order.status = STATUS.RECEIVED;
    order.delivery = {
      ...(order.delivery || {}),
      driverId,
      fee,
      acceptedAt: new Date(),
      // المحافظة محفوظة مسبقًا في order.delivery.provinceNorm (قسم الإنشاء)
    };

    await order.save();
    return res.json({ success: true, message: 'تم استلام الطلب وتحديد سعر التوصيل', order });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};

// PUT /delivery/orders/:id/start
exports.startDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    if (order.status !== STATUS.RECEIVED) {
      return res.status(409).json({ success: false, message: 'الحالة الحالية لا تسمح بالبدء' });
    }
    if (String(order.delivery?.driverId || '') !== String(driverId)) {
      return res.status(403).json({ success: false, message: 'هذا الطلب ليس مُسندًا لهذا المندوب' });
    }

    order.status = STATUS.ON_ROAD;
    order.delivery.startedAt = new Date();
    await order.save();

    return res.json({ success: true, message: 'تم بدء التوصيل', order });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};

// PUT /delivery/orders/:id/complete
exports.completeDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    if (![STATUS.ON_ROAD, STATUS.RECEIVED].includes(order.status)) {
      return res.status(409).json({ success: false, message: 'لا يمكن الإكمال من الحالة الحالية' });
    }
    if (String(order.delivery?.driverId || '') !== String(driverId)) {
      return res.status(403).json({ success: false, message: 'هذا الطلب ليس مُسندًا لهذا المندوب' });
    }

    order.status = STATUS.DELIVERED;
    order.delivery.deliveredAt = new Date();
    await order.save();

    return res.json({ success: true, message: 'تم التسليم', order });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};

// PUT /delivery/orders/:id/cancel
exports.cancelDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId, reason } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    if (order.status === STATUS.DELIVERED) {
      return res.status(409).json({ success: false, message: 'لا يمكن إلغاء طلب مُسلّم' });
    }

    // لو كان مُسنّد لمندوب آخر
    if (order.delivery?.driverId && String(order.delivery.driverId) !== String(driverId)) {
      return res.status(403).json({ success: false, message: 'هذا الطلب ليس مُسندًا لهذا المندوب' });
    }

    order.status = STATUS.CANCELED;
    order.delivery = {
      ...(order.delivery || {}),
      canceledAt: new Date(),
      canceledBy: driverId,
      cancelReason: reason || '',
    };
    await order.save();

    return res.json({ success: true, message: 'تم الإلغاء', order });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};
