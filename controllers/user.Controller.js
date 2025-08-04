const User = require('../models/user.Model');
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, prands } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      prands,
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
exports.viewsellerprands = async (req, res) => {
  try {
    const { userId } = req.params;
const prands=await User.find({userId}).select('prands');
 

    res.status(201).json({
      message: 'sucsses',
      prands,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
