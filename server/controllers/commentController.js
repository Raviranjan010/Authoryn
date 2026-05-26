const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get all comments for a post
// @route   GET /api/comments/:postId
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'name username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all recent comments across the system
// @route   GET /api/comments
// @access  Public
exports.getAllComments = async (req, res, next) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'name username avatar')
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .limit(6); // increased limit for richer dashboard analytics

    res.status(200).json({
      success: true,
      comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/comments/:postId
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Please add comment content' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    let comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text
    });

    // Populate user details to send back to client immediately
    comment = await comment.populate('user', 'name username avatar');

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Make sure user is comment owner or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
