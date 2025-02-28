const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Token configuration
const TOKEN_CONFIG = {
  access: {
    expiresIn: '15m',
    secret: process.env.JWT_ACCESS_SECRET,
    type: 'access'
  },
  refresh: {
    expiresIn: '7d',
    secret: process.env.JWT_REFRESH_SECRET,
    type: 'refresh'
  }
};

/**
 * Generate JWT token with specified configuration
 * @param {Object} user - User object
 * @param {string} tokenType - Type of token ('access' or 'refresh')
 * @returns {string} JWT token
 * @throws {Error} If invalid token type or missing configuration
 */
const generateToken = (user, tokenType) => {
  if (!TOKEN_CONFIG[tokenType]) {
    throw new Error(`Invalid token type: ${tokenType}`);
  }

  if (!user?._id) {
    throw new Error('Invalid user object');
  }

  const config = TOKEN_CONFIG[tokenType];

  const payload = {
    sub: user._id,
    type: config.type,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomBytes(16).toString('hex')
  };

  try {
    return jwt.sign(payload, config.secret, {
      expiresIn: config.expiresIn
    });
  } catch (error) {
    console.error(`Error generating ${tokenType} token:`, error);
    throw new Error(`Failed to generate ${tokenType} token`);
  }
};

/**
 * Generate access token
 * @param {Object} user - User object
 * @returns {string} Access token
 */
const generateAccessToken = (user) => {
  return generateToken(user, 'access');
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
  return generateToken(user, 'refresh');
};

/**
 * Verify JWT token
 * @param {string} token - Token to verify
 * @param {string} tokenType - Type of token ('access' or 'refresh')
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token, tokenType) => {
  if (!token || !TOKEN_CONFIG[tokenType]) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, TOKEN_CONFIG[tokenType].secret);
    
    // Verify token type matches to prevent token reuse
    if (decoded.type !== tokenType) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error(`Error verifying ${tokenType} token:`, error);
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if invalid
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing both tokens
 */
const generateAuthTokens = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

/**
 * Verify access token
 * @param {string} token - Access token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyAccessToken = (token) => {
  return verifyToken(token, 'access');
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyRefreshToken = (token) => {
  return verifyToken(token, 'refresh');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateAuthTokens,
  extractTokenFromHeader,
  TOKEN_CONFIG
};
