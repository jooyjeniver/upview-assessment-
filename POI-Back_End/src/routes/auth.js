const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get user profile (protected route)
router.get('/profile', authenticateToken, authController.getProfile);

// Update user profile (protected route)
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router; 