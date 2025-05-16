const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Handle user registration
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate request
    if (!username || !email || !password) {
      const error = new Error('Username, email, and password are required');
      error.statusCode = 400;
      throw error;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      throw error;
    }
    
    // Validate password length
    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }
    
    // Create user
    const userId = await User.create({ username, email, password });
    
    // Get user data (without password)
    const user = await User.findById(userId);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    // Handle duplicate key errors
    if (error.message.includes('already exists')) {
      error.statusCode = 409; // Conflict
    }
    
    next(error);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Validate request
    if (!username || !password) {
      const error = new Error('Username and password are required');
      error.statusCode = 400;
      throw error;
    }
    
    // Find user
    let user;
    try {
      user = await User.findByUsername(username);
    } catch (error) {
      const authError = new Error('Invalid credentials');
      authError.statusCode = 401;
      throw authError;
    }
    
    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }
    
    // Remove password from response
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user data
    const user = await User.findById(userId);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email, password } = req.body;
    
    // Update user
    const user = await User.update(userId, { username, email, password });
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}; 