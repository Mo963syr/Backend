
const cart = require('../models/cart.model');
const User = require('../models/user.Model');
const cloudinary = require('../utils/cloudinary');

const mongoose = require('mongoose');

exports.addPart = async (req, res) => {
  try {
    const {
partId , userId
    } = req.body;


    
    const addCart = new cart({
    partId , userId
    });

    await addCart.save();

    res.status(201).json({
      message: '✅ تم إضافة المنتج',
      cartproduct: addCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '❌ فشل في إضافة المنتج' });
  }
};