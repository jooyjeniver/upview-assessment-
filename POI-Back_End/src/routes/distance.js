const express = require('express');
const router = express.Router();
const distanceController = require('../controllers/distanceController');
const { authenticateToken } = require('../middleware/auth');

// Distance routes are protected
router.use(authenticateToken);

// Calculate distance between two POIs
router.post('/pois', distanceController.getDistance);

// Calculate distance between two coordinate pairs
router.post('/coordinates', distanceController.getCoordinateDistance);

module.exports = router; 