const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 500
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 2000
  },
  media: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'Invalid media file format'
    }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  visibility: {
    type: String,
    enum: ['public', 'course', 'private'],
    default: 'public'
  },
  course: {
    type: String,
    required: function() {
      return this.visibility === 'course';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
postSchema.methods.like = async function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    await this.save();
  }
  return this;
};

postSchema.methods.unlike = async function(userId) {
  this.likes = this.likes.filter(id => !id.equals(userId));
  return this.save();
};

postSchema.methods.addComment = async function(userId, content) {
  this.comments.push({
    author: userId,
    content
  });
  return this.save();
};

// Static methods
postSchema.statics.getFeed = function(userId, course = null) {
  const query = {
    $or: [
      { visibility: 'public' },
      { visibility: 'course', course }
    ]
  };
  
  return this.find(query)
    .sort('-createdAt')
    .populate('author', 'name avatar')
    .populate('comments.author', 'name avatar');
};

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ visibility: 1, course: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 