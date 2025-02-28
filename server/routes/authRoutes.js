const express = require('express');
const UserService = require('../services/userService.js');
const { requireUser } = require('./middleware/auth.js');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/auth.js');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { 
    success: false, 
    message: 'Too many login attempts. Please try again later.' 
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return tokens
 * @access Public
 */
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  try {
    const user = await UserService.authenticateWithPassword(email, password);

    if (user) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token hash in user document
      user.refreshToken = refreshToken;
      await user.save();

      return res.json({
        success: true,
        data: {
          user: user.toJSON(),
          accessToken,
          refreshToken
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const user = await UserService.create(req.body);
    return res.status(201).json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user and invalidate tokens
 * @access Protected
 */
router.post('/logout', requireUser, async (req, res) => {
  try {
    const user = await UserService.get(req.user.sub);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const user = await UserService.get(decoded.sub);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Protected
 */
router.get('/me', requireUser, async (req, res) => {
  try {
    const user = await UserService.get(req.user.sub);
    return res.status(200).json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

module.exports = router;
