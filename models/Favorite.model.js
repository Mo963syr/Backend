const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
}, { timestamps: true });

// منع التكرار لنفس القطعة عند نفس المستخدم
favoriteSchema.index({ userId: 1, partId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
