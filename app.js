const express = require('express');
const mongoose = require('mongoose');
const carRoutes = require('./routes/car.Routes');
const userRoutes = require('./routes/user.Routes');
const partRoutes = require('./routes/part.Routes');
const cartRoutes = require('./routes/cart.Routes');
const orderRoutes = require('./routes/order.routes');
const modelsRoute = require('./routes/models');
const favoritesRoutes = require('./routes/favorites.Routes');
const req = require('./routes/recommendationOffer.Routes');
const deliveryRoutes = require('./routes/delivery.routes');
const Comment =require('./routes/comment.routes')
const app = express();
app.use(express.json());

app.use('/cars', carRoutes);
app.use('/user', userRoutes);
app.use('/auth', userRoutes);
app.use('/part', partRoutes);
app.use('/cart', cartRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/order', orderRoutes);
app.use('/api/models', modelsRoute);
app.use('/favorites', favoritesRoutes);
app.use('/order', req);
app.use('/comment',Comment);

const uri =
  'mongodb+srv://moafaqaqeed01:JqphSStXpXgsv8t@cluster0.vhz1h.mongodb.net/PartTec?retryWrites=true&w=majority';

mongoose
  .connect(uri)
  .then(() => {
    console.log('✅ تم الاتصال بقاعدة بيانات PartTec في MongoDB Atlas');
  })
  .catch((err) => {
    console.error('❌ فشل الاتصال:', err);
  });

app.listen(3000, () => {
  console.log('الخادم يعمل على المنفذ 3000');
});
