// controllers/comment.controller.js
const Comment = require('../models/Comment.model');
const Part = require('../models/part.Model');

exports.addComment = async (req, res) => {
  try {
    const { partId, userId, content } = req.body;
    if (!partId || !userId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'بيانات غير مكتملة' });
    }
    const part = await Part.findById(partId).select('_id');
    if (!part) return res.status(404).json({ success: false, message: 'القطعة غير موجودة' });

    const comment = await Comment.create({ part: partId, user: userId, content: content.trim() });
    await Part.findByIdAndUpdate(partId, { $push: { comments: comment._id } });

    const populated = await Comment.findById(comment._id)
      .populate('user', 'name _id')
      .populate('part', 'name user');

    return res.status(201).json({ success: true, message: 'تم إضافة التعليق', comment: populated });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'خطأ في السيرفر' });
  }
};

exports.getPartComments = async (req, res) => {
  try {
    const { partId } = req.params;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const skip = (page - 1) * limit;

    const part = await Part.findById(partId).select('_id');
    if (!part) return res.status(404).json({ success: false, message: 'القطعة غير موجودة' });

    const [items, total] = await Promise.all([
      Comment.find({ part: partId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name _id')
        .lean(),
      Comment.countDocuments({ part: partId }),
    ]);

    return res.status(200).json({
      success: true,
      comments: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'خطأ في السيرفر' });
  }
};
