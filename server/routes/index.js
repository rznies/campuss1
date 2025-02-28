// server/routes/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const matchRoutes = require('./matchRoutes');
const chatRoutes = require('./chatRoutes');
const postRoutes = require('./postRoutes');
const userRoutes = require('./userRoutes');
const complimentRoutes = require('./complimentRoutes');
const { requireUser, requireAdmin } = require('./middleware/auth');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/matches', requireUser, matchRoutes);
router.use('/chat', requireUser, chatRoutes);
router.use('/posts', requireUser, postRoutes);
router.use('/users', requireUser, userRoutes);
router.use('/compliments', requireUser, complimentRoutes);

// Admin routes
router.use('/admin', requireUser, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: req.user
  });
});

// Error handling for invalid routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Route error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

module.exports = router;