const express = require('express');
const router = express.Router();
const Compliment = require('../models/Compliment');
const User = require('../models/User');
const { authenticateToken } = require('./middleware/auth');

// Log an error if the middleware is unexpectedly undefined.
if (typeof authenticateToken !== 'function') {
  console.error('authenticateToken middleware is undefined. Check the export in ./middleware/auth.js');
}

// Get compliments for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const compliments = await Compliment.find({ recipient: userId })
      .populate('sender', 'profile.name')
      .sort({ createdAt: -1 });
    
    const formattedCompliments = compliments.map(comp => ({
      _id: comp._id,
      message: comp.message,
      sender: comp.sender ? comp.sender.profile.name : 'Anonymous',
      createdAt: comp.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedCompliments
    });
  } catch (error) {
    console.error('Error fetching compliments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliments'
    });
  }
});

// Send a compliment
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user.id;
    
    // Input validation
    if (!recipientId || !message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and message are required'
      });
    }
    
    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long (maximum 500 characters)'
      });
    }
    
    // Prevent sending compliments to yourself
    if (senderId === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send compliments to yourself'
      });
    }
    
    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    // Rate limiting - check if user has sent too many compliments recently
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentCompliments = await Compliment.countDocuments({
      sender: senderId,
      createdAt: { $gte: lastHour }
    });
    
    if (recentCompliments >= 10) {
      return res.status(429).json({
        success: false,
        message: 'You have sent too many compliments recently. Please try again later.'
      });
    }
    
    const newCompliment = new Compliment({
      sender: senderId,
      recipient: recipientId,
      message: message.trim()
    });
    
    await newCompliment.save();
    
    // Award points to the sender for being kind
    await User.findByIdAndUpdate(senderId, { $inc: { points: 10 } });
    
    res.status(201).json({
      success: true,
      data: {
        _id: newCompliment._id,
        message: newCompliment.message,
        sender: senderId,
        recipient: recipientId,
        createdAt: newCompliment.createdAt
      }
    });
  } catch (error) {
    console.error('Error sending compliment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send compliment'
    });
  }
});

module.exports = router;
