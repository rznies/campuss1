const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @return {boolean} True if password meets requirements
 */
const isStrongPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  
  const hasMinLength = password.length >= MIN_PASSWORD_LENGTH;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

/**
 * Hashes the password using bcrypt algorithm
 * @param {string} password - The password to hash
 * @return {Promise<string>} Password hash
 * @throws {Error} If password is invalid or hashing fails
 */
const generatePasswordHash = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password provided');
  }

  if (!isStrongPassword(password)) {
    throw new Error('Password does not meet security requirements');
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Failed to secure password');
  }
};

/**
 * Validates the password against the hash
 * @param {string} password - The password to verify
 * @param {string} hash - Password hash to verify against
 * @return {Promise<boolean>} True if the password matches the hash
 * @throws {Error} If inputs are invalid or comparison fails
 */
const validatePassword = async (password, hash) => {
  if (!password || !hash) {
    throw new Error('Password and hash are required');
  }

  if (!isPasswordHash(hash)) {
    throw new Error('Invalid password hash format');
  }

  try {
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error) {
    console.error('Password validation failed:', error);
    throw new Error('Failed to verify password');
  }
};

/**
 * Checks that the hash has a valid format
 * @param {string} hash - Hash to check format for
 * @return {boolean} True if passed string seems like valid hash
 */
const isPasswordHash = (hash) => {
  if (!hash || hash.length !== 60) return false;
  try {
    bcrypt.getRounds(hash);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  generatePasswordHash,
  validatePassword,
  isPasswordHash,
  isStrongPassword,
  MIN_PASSWORD_LENGTH
};
