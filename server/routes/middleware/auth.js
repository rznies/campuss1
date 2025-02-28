const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const UserService = require('../../services/userService.js');
const { verifyAccessToken, extractTokenFromHeader } = require('../../utils/auth.js');

/**
 * Middleware to require authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireUser = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Verify user still exists and is active
    const user = await UserService.get(decoded.sub);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled'
      });
    }

    // Add user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

/**
 * Middleware to require admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdmin = async (req, res, next) => {
  try {
    // First run the requireUser middleware
    await requireUser(req, res, async () => {
      // Check if user has admin role
      const user = await UserService.get(req.user.sub);
      if (!user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization failed'
    });
  }
};

/**
 * Optional middleware to attach user if token is present
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const attachUser = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await UserService.get(decoded.sub);
        if (user && !user.isDisabled) {
          req.user = decoded;
        }
      }
    }
    next();
  } catch (error) {
    console.error('User attachment error:', error);
    next();
  }
};

// This middleware checks for the presence of an access token in the Authorization header.
function authenticateToken(req, res, next) {
  // Get the token from the Authorization header in the format "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  // Verify the token using your secret (ensure ACCESS_TOKEN_SECRET is set in your environment variables)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    // Attach the decoded token (user payload) to the request object.
    req.user = decoded;
    next();
  });
}

module.exports = {
  requireUser,
  requireAdmin,
  attachUser,
  authenticateToken
};
