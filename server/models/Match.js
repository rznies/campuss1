const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  compatibilityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchReason: {
    type: String,
    required: true
  },
  commonInterests: [{
    type: String
  }],
  lastInteractionDate: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
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

// Ensure users array always has exactly 2 users
matchSchema.pre('save', function(next) {
  if (this.users.length !== 2) {
    next(new Error('A match must have exactly 2 users'));
  }
  next();
});

// Update lastInteractionDate when status changes
matchSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastInteractionDate = new Date();
  }
  next();
});

// Method to check if match is expired
matchSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Method to accept match
matchSchema.methods.accept = async function() {
  if (this.status !== 'pending') {
    throw new Error('Can only accept pending matches');
  }
  this.status = 'accepted';
  return this.save();
};

// Method to decline match
matchSchema.methods.decline = async function() {
  if (this.status !== 'pending') {
    throw new Error('Can only decline pending matches');
  }
  this.status = 'declined';
  return this.save();
};

// Static method to find active matches for a user
matchSchema.statics.findActiveMatches = function(userId) {
  return this.find({
    users: userId,
    status: 'accepted',
    expiresAt: { $gt: new Date() }
  }).populate('users', 'name avatar course interests');
};

// Static method to find pending matches for a user
matchSchema.statics.findPendingMatches = function(userId) {
  return this.find({
    users: userId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('users', 'name avatar course interests');
};

// Indexes
matchSchema.index({ users: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ expiresAt: 1 });
matchSchema.index({ 'users': 1, 'status': 1, 'expiresAt': 1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match; 