const Post = require('../models/Post');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');

// Simple in-memory cache to debounce post views by IP + Post Slug
const postViewsCache = new Set();

// @desc    Get all published posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const tag = req.query.tag || '';
    const sort = req.query.sort || 'newest';

    // Build match object
    const match = { status: 'published' };

    // Search filter (title or body match)
    if (search) {
      match.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    // Tag filter
    if (tag) {
      match.tags = tag;
    }

    // Sorting definition
    let sortObj = {};
    if (sort === 'views') {
      sortObj = { viewCount: -1 };
    } else if (sort === 'likes') {
      // We will sort using an aggregation or post-query if sorting by likes.
      // Below we do a custom aggregation to support pagination & likes sorting.
    } else {
      sortObj = { createdAt: -1 };
    }

    // Count total matching documents for pagination
    const total = await Post.countDocuments(match);

    let posts;
    if (sort === 'likes') {
      // Aggregation for likes sorting
      posts = await Post.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        {
          $addFields: {
            likesCount: { $size: '$likes' }
          }
        },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            'author.password': 0,
            'author.email': 0,
            'author.role': 0
          }
        }
      ]);
    } else {
      // Standard Mongoose query
      posts = await Post.find(match)
        .populate('author', 'name username avatar bio')
        .sort(sortObj)
        .skip(skip)
        .limit(limit);
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by slug or ID
// @route   GET /api/posts/:slug
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const slugOrId = req.params.slug;
    
    // Check if the param is a valid ObjectId, otherwise query by slug
    const query = mongoose.Types.ObjectId.isValid(slugOrId)
      ? { _id: slugOrId }
      : { slug: slugOrId };

    const post = await Post.findOne(query)
      .populate('author', 'name username avatar bio');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Debounce view count increment per user session (using IP + slug in memory cache)
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown-ip';
    const cacheKey = `${clientIp}:${slug}`;

    if (!postViewsCache.has(cacheKey)) {
      post.viewCount += 1;
      await post.save();
      postViewsCache.add(cacheKey);

      // Remove from cache after 30 minutes to allow re-view count
      setTimeout(() => {
        postViewsCache.delete(cacheKey);
      }, 30 * 60 * 1000);
    }

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { title, body, tags, status } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Please add a title and body content' });
    }

    // Handle cover image
    let coverImageUrl = '';
    if (req.file) {
      coverImageUrl = await uploadToCloudinary(req.file.path, 'authoryn/covers');
    }

    // Parse tags (comma separated string to array of trimmed lowercased strings)
    let parsedTags = [];
    if (tags) {
      parsedTags = tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
    }

    const post = await Post.create({
      title,
      body,
      tags: parsedTags,
      coverImage: coverImageUrl,
      status: status || 'draft',
      author: req.user._id
    });

    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Make sure user is post owner or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }

    const { title, body, tags, status } = req.body;

    // Handle new cover image if uploaded
    let coverImageUrl = post.coverImage;
    if (req.file) {
      coverImageUrl = await uploadToCloudinary(req.file.path, 'authoryn/covers');
    }

    // Parse tags if provided
    let parsedTags = post.tags;
    if (tags !== undefined) {
      parsedTags = tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
    }

    // Update fields
    if (title) post.title = title; // triggers pre-validate slug update
    if (body) post.body = body;
    if (tags !== undefined) post.tags = parsedTags;
    if (status) post.status = status;
    post.coverImage = coverImageUrl;

    await post.save();

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Make sure user is post owner or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle post like
// @route   POST /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Already liked, so unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Not liked, so add like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      likes: post.likes,
      likesCount: post.likes.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts by specific user
// @route   GET /api/posts/user/:username
// @access  Public
exports.getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const author = await User.findOne({ username: username.toLowerCase() });

    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }

    // Determine if requester is the owner of the profile
    const isOwner = req.user && req.user._id.toString() === author._id.toString();

    // If owner, show both drafts and published; else show only published posts
    const query = { author: author._id };
    if (!isOwner) {
      query.status = 'published';
    }

    const posts = await Post.find(query)
      .populate('author', 'name username avatar bio')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    next(error);
  }
};
