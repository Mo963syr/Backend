const User = require('../models/user.Model');

exports.updateUserLocation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lng, lat } = req.body;

    if (!userId || lng === undefined || lat === undefined) {
      return res.status(400).json({
        success: false,
        message: '⚠️ يجب إرسال userId و lng و lat',
      });
    }

    if (typeof lng !== 'number' || typeof lat !== 'number') {
      return res.status(400).json({
        success: false,
        message: '⚠️ يجب أن تكون الإحداثيات أرقام',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          location: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '❌ المستخدم غير موجود',
      });
    }

    res.status(200).json({
      success: true,
      message: '✅ تم تحديث الموقع بنجاح',
      user,
    });
  } catch (err) {
    console.error('❌ خطأ في تحديث الموقع:', err);
    res.status(500).json({
      success: false,
      message: '❌ فشل في تحديث الموقع',
      error: err.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('_id');

    const user_id = users.map((u) => u._id);

    res.status(200).json({
      success: true,
      count: user_id.length,
      user_id,
    });
  } catch (err) {
    console.error('❌ خطأ عند جلب المستخدمين:', err);
    res.status(500).json({
      success: false,
      message: 'فشل جلب المستخدمين',
    });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, prands, companyName, role } =
      req.body;

    const user = await User.create({
      name,
      email,
      companyName,
      password,
      phoneNumber,
      prands,
      role,
    });

    await user.save();

    res.status(201).json({
      message: 'account created sucsses',
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.putprands = async (req, res) => {
  try {
    let { prand } = req.body;
    const { userId } = req.params;

    if (typeof prand === 'string') {
      prand = prand.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { prands: prand } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    res.status(200).json({
      message: '✅ prand added successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.viewsellerprands = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('prands');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.status(200).json({
      message: 'success',
      prands: user.prands,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
