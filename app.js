const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const carRoutes = require('./routes/car.Routes');
const userRoutes = require('./routes/user.Routes');
const partRoutes = require('./routes/part.Routes');
const cartRoutes = require('./routes/cart.Routes');
const orderRoutes = require('./routes/order.routes');
const modelsRoute = require('./routes/models');
const favoritesRoutes = require('./routes/favorites.Routes');
const req = require('./routes/recommendationOffer.Routes');
const deliveryRoutes = require('./routes/delivery.routes');
const Comment = require('./routes/comment.routes');
const admin = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/payment.Routes');
const pricingRoutes = require('./routes/pricingRoutes');

const app = express();
app.use(express.json());

app.use('/pricing', pricingRoutes);
app.use('/cars', carRoutes);
app.use('/admin', admin);
app.use('/user', userRoutes);
app.use('/auth', userRoutes);
app.use('/part', partRoutes);
app.use('/cart', cartRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/order', orderRoutes);
app.use('/api/models', modelsRoute);
app.use('/favorites', favoritesRoutes);
app.use('/order', req);
app.use('/comment', Comment);
app.use('/payment', paymentRoutes);
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  const uri = process.env.MONGO_URI;
  mongoose
    .connect(uri)
    .then(() => {
      console.log('✅ تم الاتصال بقاعدة بيانات PartTec في MongoDB Atlas');
      app.listen(PORT, () => {
        console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ فشل الاتصال:', err);
    });
}

module.exports = app;
