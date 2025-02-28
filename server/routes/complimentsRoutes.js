const express = require('express');
const router = express.Router();
const Compliment = require('../models/Compliment');
const User = require('../models/User');
const { authenticateToken } = require('./middleware/auth');

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
    
    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and message are required'
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
    
    const newCompliment = new Compliment({
      sender: senderId,
      recipient: recipientId,
      message
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