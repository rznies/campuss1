const express = require('express');
const router = express.Router();
const Conversation = require('../models/Chat');
const { authenticateToken } = require('./middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limit for sending messages
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: {
    success: false,
    message: 'Too many messages, please wait a moment'
  }
});

// Get all conversations for the current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await Conversation.find({
      participants: userId
    }).populate({
      path: 'participants',
      match: { _id: { $ne: userId } },
      select: 'profile.name profile.avatar _id'
    }).sort({ lastMessageAt: -1 });

    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.participants[0];
      return {
        _id: conv._id,
        user: {
          _id: otherUser._id,
          name: otherUser.profile.name,
          avatar: otherUser.profile.avatar
        },
        lastMessage: conv.lastMessage,
        unread: conv.unreadCounts.get(userId.toString()) || 0,
        lastMessageAt: conv.lastMessageAt
      };
    });

    res.status(200).json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Get messages for a specific conversation
router.get('/messages/:conversationId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    }).populate({
      path: 'messages.sender',
      select: '_id profile.name'
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Reset unread count for this user
    if (conversation.unreadCounts.has(userId.toString())) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }
    
    const messages = conversation.messages.map(msg => ({
      _id: msg._id,
      sender: {
        _id: msg.sender._id,
        name: msg.sender.profile.name
      },
      message: msg.message,
      createdAt: msg.createdAt
    }));
    
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a message
router.post('/send', authenticateToken, messageLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, message } = req.body;
    
    if (!message || !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Message and conversation ID are required'
      });
    }
    
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Add new message
    const newMessage = {
      sender: userId,
      message,
      createdAt: new Date()
    };
    
    conversation.messages.push(newMessage);
    conversation.lastMessage = message;
    conversation.lastMessageAt = new Date();
    
    // Update unread counts for other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== userId.toString()) {
        const currentCount = conversation.unreadCounts.get(participantId.toString()) || 0;
        conversation.unreadCounts.set(participantId.toString(), currentCount + 1);
      }
    });
    
    await conversation.save();
    
    res.status(201).json({
      success: true,
      data: { messageId: conversation.messages[conversation.messages.length - 1]._id }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

module.exports = router;