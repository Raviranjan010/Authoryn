const mongoose = require('mongoose');
const slugify = require('slugify');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Please add post body content']
  },
  thumbnail: {
    type: String,
    default: '' // Cloudinary URL or local path
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  tags: {
    type: [String],
    default: []
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  viewCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Create post slug from the title before saving
PostSchema.pre('validate', async function(next) {
  if (!this.isModified('title')) {
    next();
    return;
  }
  
  let basicSlug = slugify(this.title, { lower: true, strict: true });
  
  // Ensure slug is unique by querying existing posts
  let uniqueSlug = basicSlug;
  let counter = 1;
  const PostModel = this.constructor;
  
  while (true) {
    const existing = await PostModel.findOne({ slug: uniqueSlug, _id: { $ne: this._id } });
    if (!existing) {
      break;
    }
    uniqueSlug = `${basicSlug}-${counter}`;
    counter++;
  }
  
  this.slug = uniqueSlug;
  next();
});

module.exports = mongoose.model('Post', PostSchema);
