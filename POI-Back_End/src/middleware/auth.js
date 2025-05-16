const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate users based on JWT token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
      const error = new Error('Authentication token is required');
      error.statusCode = 401;
      throw error;
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 401;
        throw error;
      }
      
      // Add user info to request object
      req.user = {
        id: user.id,
        username: user.username
      };
      
      next();
    } catch (jwtError) {
      const error = new Error('Invalid or expired token');
      error.statusCode = 401;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if a user has admin role
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user with role information
    const user = await User.findById(userId);
    
    if (user.role !== 'admin') {
      const error = new Error('Admin access required');
      error.statusCode = 403;
      throw error;
    }
    
    next();
  } catch (error) {
    next(error);
  }
}; 