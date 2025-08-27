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

exports.listDeliveryOrders = async (req, res) => {
  try {
    const { status = STATUS.CONFIRMED, driverId } = req.query;
    if (!driverId)
      return res
        .status(400)
        .json({ success: false, message: 'driverId مفقود' });
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res
        .status(400)
        .json({ success: false, message: 'driverId غير صالح' });
    }

    const driver = await User.findById(driverId).select(
      'role province provinceNorm'
    );
    if (!driver || driver.role !== 'delevery') {
      return res
        .status(403)
        .json({ success: false, message: 'المستخدم ليس موظف توصيل' });
    }

    const driverProvNorm = normalizeProvince(
      driver.provinceNorm || driver.province
    );
    if (!driverProvNorm) {
      return res
        .status(400)
        .json({ success: false, message: 'محافظة المندوب غير محددة' });
    }

    const match =
      status === STATUS.CONFIRMED
        ? {
            status: STATUS.CONFIRMED,
            $or: [
              { 'delivery.driverId': null },
              { 'delivery.driverId': { $exists: false } },
            ],
          }
        : { status, 'delivery.driverId': driver._id };
    match['delivery.provinceNorm'] = driverProvNorm;

    const orders = await Order.find(match)
      .sort({ createdAt: -1 })
      .populate([
        { path: 'userId', select: 'name phone phoneNumber' },
        {
          path: 'cartIds',
          populate: [
            {
              path: 'partId',
              select: 'name manufacturer model price',
              populate: [
                { path: 'user', select: 'name phoneNumber' },
           
              ],
            },

          
          ],
        },
        {
          path: 'summaryIds',
          populate: [
            { path: 'order' },
            {
              path: 'offer',
              select: 'price',
              populate: { path: 'seller' },
            },
          ],
        },
      ])
      .lean();

    const shaped = orders.map((o) => {
      const partName = o?.cartIds?.[0]?.partId?.name ?? 'قطعة غير معروفة';
      const partName1 = o?.summaryIds?.[0]?.order?.name ?? 'قطعة غير معروفة';

      const partspici = o?.summaryIds?.[0]?.order?.name ?? 'قطعة غير معروفة';

      const partmanufacturer =
        o?.cartIds?.[0]?.partId?.manufacturer ?? 'قطعة غير معروفة';
      const partmanufacturer1 =
        o?.summaryIds?.[0]?.order?.manufacturer ?? 'قطعة غير معروفة';

        const price =
        o?.cartIds?.[0]?.partId?.price ?? 'قطعة غير معروفة';
        const price1 =
       o?.summaryIds?.[0]?.order?.price ?? 'قطعة غير معروفة';
      const part = {
        name: partName,
        manufacturer: partmanufacturer ?? '',
        price:price?? '',
      };
      const part1 = {
        name: partName1,
        manufacturer: partmanufacturer1 ?? '',
        price:price1?? '',
      };

      const c = o.userId || {};
      const customer = {
        name: c.name ?? 'غير محدد',
        phoneNumber: c.phoneNumber ?? c.phone ?? '',
      };

    
      const sellerFromSummary = o?.summaryIds?.[0]?.offer?.seller || null;
      const sellerFrom = o?.cartIds?.[0]?.partId?.user || null;
      const sellerFromCart =
        o?.cartIds?.[0]?.sellerId || 
        o?.cartIds?.[0]?.partId?.seller || 
        null;

      const s = sellerFromSummary ?? sellerFromCart ?? {};
      const s1 = sellerFrom ?? sellerFromCart ?? {};
      const seller = {
        name: s.name ?? s1.name ?? 'غير محدد',
        phoneNumber: s.phoneNumber ?? s1.phoneNumber ?? s.phone ?? '',
      };

      return {
        _id: o._id,
        orderId: o.orderId,
        status: o.status,
        part ,part1,
        customer,
        seller,
        delivery: o.delivery,
        createdAt: o.createdAt,
      };
    });

    return res.json({ success: true, orders: shaped  });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};


exports.acceptDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId, fee } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(driverId)
    ) {
      return res.status(400).json({ success: false, message: 'معرف غير صالح' });
    }
    if (typeof fee !== 'number' || fee <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'سعر التوصيل غير صالح' });
    }

    const order = await Order.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: 'الطلب غير موجود' });
    if (order.status !== STATUS.CONFIRMED) {
      return res
        .status(409)
        .json({ success: false, message: 'لا يمكن قبول طلب غير مؤكد' });
    }

    order.status = STATUS.RECEIVED;
    order.delivery = {
      ...(order.delivery || {}),
      driverId,
      fee,
      acceptedAt: new Date(),
    
    };

    await order.save();
    return res.json({
      success: true,
      message: 'تم استلام الطلب وتحديد سعر التوصيل',
      order,
    });
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
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: 'الطلب غير موجود' });
    if (order.status !== STATUS.RECEIVED) {
      return res
        .status(409)
        .json({ success: false, message: 'الحالة الحالية لا تسمح بالبدء' });
    }
    if (String(order.delivery?.driverId || '') !== String(driverId)) {
      return res.status(403).json({
        success: false,
        message: 'هذا الطلب ليس مُسندًا لهذا المندوب',
      });
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
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: 'الطلب غير موجود' });
    if (![STATUS.ON_ROAD, STATUS.RECEIVED].includes(order.status)) {
      return res
        .status(409)
        .json({ success: false, message: 'لا يمكن الإكمال من الحالة الحالية' });
    }
    if (String(order.delivery?.driverId || '') !== String(driverId)) {
      return res.status(403).json({
        success: false,
        message: 'هذا الطلب ليس مُسندًا لهذا المندوب',
      });
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
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: 'الطلب غير موجود' });
    if (order.status === STATUS.DELIVERED) {
      return res
        .status(409)
        .json({ success: false, message: 'لا يمكن إلغاء طلب مُسلّم' });
    }

    // لو كان مُسنّد لمندوب آخر
    if (
      order.delivery?.driverId &&
      String(order.delivery.driverId) !== String(driverId)
    ) {
      return res.status(403).json({
        success: false,
        message: 'هذا الطلب ليس مُسندًا لهذا المندوب',
      });
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
