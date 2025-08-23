const User = require('../models/user.Model');
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
      role
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
