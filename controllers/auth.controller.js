const User = require('../models/user.Model');

exports.register=async(req,res)=>{

  const { name ,phoneNumber, email , password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    } else if (email == null) {
      return res.status(400).json({ message: 'email not vaild' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      role,
      name,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    await user.save();

    const userResponse = {
      role:user.role,
      _id: user._id,
      name: user.name,
 
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    };
    return res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred during sign up' });
  }



};