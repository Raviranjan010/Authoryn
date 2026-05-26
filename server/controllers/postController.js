const Post = require('../models/Post');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');
const Subscriber = require('../models/Subscriber');
const sendEmail = require('../utils/sendEmail');

// Helper to broadcast newsletter to subscribers in background
const broadcastNewsletter = async (post, author) => {
  try {
    const activeSubscribers = await Subscriber.find({ active: true });
    if (!activeSubscribers || activeSubscribers.length === 0) {
      console.log('No active subscribers to send newsletter.');
      return;
    }

    const hostUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const postUrl = \`\${hostUrl}/post/\${post.slug}\`;

    // Generate preview: strip HTML tags and take the first 350 characters
    const cleanContent = post.content.replace(/<[^>]*>/g, '').substring(0, 350) + '...';

    for (const sub of activeSubscribers) {
      const unsubscribeUrl = \`\${backendUrl}/api/subscribers/unsubscribe?email=\${encodeURIComponent(sub.email)}\`;
      
      const htmlContent = \`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f9fb;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      background-color: #f7f9fb;
      width: 100%;
      padding: 40px 0;
    }
    .container {
      background-color: #ffffff;
      max-width: 600px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .header {
      padding: 32px;
      border-bottom: 1px solid #f1f5f9;
      text-align: center;
      background-color: #ffffff;
    }
    .brand {
      color: #10b981;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      text-decoration: none;
    }
    .content {
      padding: 32px;
      text-align: left;
    }
    .category {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 12px;
    }
    .title {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.3;
      color: #111827;
      margin: 0 0 16px 0;
    }
    .author-bar {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 24px;
    }
    .post-body {
      font-size: 16px;
      line-height: 1.8;
      color: #334155;
      margin-bottom: 24px;
    }
    .footer {
      padding: 24px 32px;
      background-color: #fafafa;
      border-top: 1px solid #f1f5f9;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    .unsubscribe-link {
      color: #10b981;
      text-decoration: underline;
    }
    .btn-read-more {
      display: inline-block;
      background-color: #10b981;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="\${hostUrl}" class="brand" style="color: #10b981; font-weight: 800; font-size: 24px; text-decoration: none;">Authoryn</a>
      </div>
      <div class="content">
        <div class="category">\${post.category || 'Story'}</div>
        <h1 class="title">\${post.title}</h1>
        <div class="author-bar">Published by \${author.name || 'Authoryn Writer'}</div>
        
        <div class="post-body">
          <p>\${cleanContent}</p>
        </div>

        <div style="text-align: center;">
          <a href="\${postUrl}" class="btn-read-more">Read the Full Article</a>
        </div>
      </div>
      <div class="footer">
        <p>You received this email because you subscribed to updates from Authoryn.</p>
        <p>
          <a href="\${unsubscribeUrl}" class="unsubscribe-link">Unsubscribe</a> from this newsletter.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
\`;

      await sendEmail({
        to: sub.email,
        subject: \`New Post on Authoryn: \${post.title}\`,
        html: htmlContent
      });
    }
  } catch (error) {
    console.error('Error broadcasting newsletter:', error);
  }
};


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
    const category = req.query.category || '';
    const sort = req.query.sort || 'newest';

    // Build match object
    const match = { status: 'published' };

    // Search filter (title or content match)
    if (search) {
      match.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Tag filter
    if (tag) {
      match.tags = tag;
    }

    // Category filter
    if (category) {
      match.category = { $regex: new RegExp(`^${category}$`, 'i') };
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
    const cacheKey = `${clientIp}:${post.slug}`;

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
    const { title, content, category, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please add a title and content' });
    }

    // Handle cover image
    let thumbnailUrl = '';
    if (req.file) {
      thumbnailUrl = await uploadToCloudinary(req.file.path, 'authoryn/covers');
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
      content,
      category: category || 'Uncategorized',
      tags: parsedTags,
      thumbnail: thumbnailUrl,
      status: status || 'draft',
      author: req.user._id
    });

    // Send newsletter if published and sendNewsletter checked
    const sendNewsletter = req.body.sendNewsletter === 'true' || req.body.sendNewsletter === true;
    if (post.status === 'published' && sendNewsletter) {
      // Broadcast newsletter in background
      broadcastNewsletter(post, req.user);
    }

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

    const { title, content, category, tags, status } = req.body;

    // Handle new cover image if uploaded
    let thumbnailUrl = post.thumbnail;
    if (req.file) {
      thumbnailUrl = await uploadToCloudinary(req.file.path, 'authoryn/covers');
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
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags !== undefined) post.tags = parsedTags;
    if (status) post.status = status;
    post.thumbnail = thumbnailUrl;

    await post.save();

    // Send newsletter if published and sendNewsletter checked
    const sendNewsletter = req.body.sendNewsletter === 'true' || req.body.sendNewsletter === true;
    if (post.status === 'published' && sendNewsletter) {
      // Broadcast newsletter in background
      broadcastNewsletter(post, req.user);
    }

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
