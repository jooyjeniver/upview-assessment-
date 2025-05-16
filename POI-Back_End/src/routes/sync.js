const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { authenticateToken } = require('../middleware/auth');

// Sync route is protected
router.use(authenticateToken);

// Sync POIs from client to server
router.post('/', syncController.syncPois);

module.exports = router;