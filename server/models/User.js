const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId, // Explicitly set default to ensure auto-generation
    auto: true // Ensure Mongoose auto-generates _id
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Basic email format validation
      },
      message: props => `${props.value} is not a valid email address`
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'] // Enforce minimum length
  },
  name: {
    type: String,
    required: [true, 'Name is required'], // Making name required to match client-side validation
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  course: {
    type: String,
    default: null
  },
  interests: {
    type: [String],
    default: []
  },
  points: {
    type: Number,
    default: 0
  },
  badges: {
    type: [String],
    default: []
  },
  refreshToken: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true // Prevent updates to createdAt
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, // Use Mongoose timestamps for consistency
  _id: true // Ensure _id is enabled (default, but explicit for clarity)
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt before saving (except for password changes, handled above)
userSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('password')) {
    this.updatedAt = new Date();
  }
  next();
});

// Method to sanitize user object for JSON responses
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login time
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Method to add points
userSchema.methods.addPoints = async function(points) {
  if (typeof points !== 'number' || points < 0) {
    throw new Error('Points must be a non-negative number');
  }
  this.points += points;
  return this.save();
};

// Method to add a badge
userSchema.methods.addBadge = async function(badge) {
  if (typeof badge !== 'string' || !badge.trim()) {
    throw new Error('Badge must be a non-empty string');
  }
  if (!this.badges.includes(badge)) {
    this.badges.push(badge);
    return this.save();
  }
  return this;
};

// Static method to find by email (case-insensitive)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Indexes for performance
userSchema.index({ email: 1 }); // Unique index on email (already implied by unique: true)
userSchema.index({ points: -1 }); // Index for sorting by points (descending)
userSchema.index({ createdAt: -1 }); // Index for sorting by creation date (descending)

// Optional: Validate interests array elements
userSchema.path('interests').validate({
  validator: function(v) {
    return v.every(item => typeof item === 'string' && item.trim().length > 0);
  },
  message: 'Interests must be non-empty strings'
});

// Post-save hook to log _id (for debugging)
userSchema.post('save', function(doc) {
  console.log(`User saved with _id: ${doc._id}`);
});

module.exports = mongoose.model('User', userSchema);