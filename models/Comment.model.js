// models/comment.model.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
    content: { type: String, required: true, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
