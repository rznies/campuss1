const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    type: String
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chat', chatSchema);