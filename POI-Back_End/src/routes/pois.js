const express = require('express');
const router = express.Router();
const poiController = require('../controllers/poiController');
const { authenticateToken } = require('../middleware/auth');

// All POI routes are protected
router.use(authenticateToken);

// Get all POIs for authenticated user
router.get('/', poiController.getAll);

// Get nearby POIs
router.get('/nearby', poiController.findNearby);

// Create new POI
router.post('/', poiController.create);

// Get single POI by ID
router.get('/:id', poiController.getById);

// Update POI
router.put('/:id', poiController.update);

// Delete POI
router.delete('/:id', poiController.delete);

module.exports = router;