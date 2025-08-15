const User = require('../models/user.Model');
const bcrypt = require('bcrypt');
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

exports.login=async(req,res)=>{
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const response = {
      message: 'Sign in successful',
   
      userId: user._id,

      role: user.role,
    };

    if (user.role === 'doctor') {
      response.status = 'doctor dashboard';
    } else if (user.role === 'user') {
      response.status = 'user dashboard';
    } else if (user.role === 'coordinator') {
      response.status = 'coordinator dashboard';
    } else if (user.role === 'employee') {
      response.status = 'employee dashboard';
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }



};