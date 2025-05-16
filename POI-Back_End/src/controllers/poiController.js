const POI = require('../models/POI');

/**
 * Get all POIs for the authenticated user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.getAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pois = await POI.findAllByUser(userId);
    
    res.json({
      success: true,
      count: pois.length,
      data: pois
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single POI by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.getById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const poiId = req.params.id;
    
    if (!poiId) {
      const error = new Error('POI ID is required');
      error.statusCode = 400;
      throw error;
    }
    
    const poi = await POI.findById(poiId);
    
    if (poi.user_id !== userId) {
      const error = new Error('Unauthorized access to this POI');
      error.statusCode = 403;
      throw error;
    }
    
    res.json({
      success: true,
      data: poi
    });
  } catch (error) {
    if (error.message === 'POI not found') {
      error.statusCode = 404;
    }
    next(error);
  }
};

/**
 * Create a new POI
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description, latitude, longitude, category, is_visited, client_id } = req.body;
    
    // Validate required fields
    if (!name || latitude === undefined || longitude === undefined) {
      const error = new Error('Name, latitude, and longitude are required');
      error.statusCode = 400;
      throw error;
    }
    
    // Validate latitude and longitude
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      const error = new Error('Invalid latitude or longitude values');
      error.statusCode = 400;
      throw error;
    }
    
    const poiData = {
      user_id: userId,
      name,
      description,
      latitude,
      longitude,
      category,
      is_visited,
      client_id
    };
    
    const poiId = await POI.create(poiData);
    const poi = await POI.findById(poiId);
    
    res.status(201).json({
      success: true,
      data: poi
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a POI
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.update = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const poiId = req.params.id;
    const { name, description, latitude, longitude, category, is_visited } = req.body;
    
    if (!poiId) {
      const error = new Error('POI ID is required');
      error.statusCode = 400;
      throw error;
    }
    
    // Check if POI exists and belongs to user
    try {
      const existingPoi = await POI.findById(poiId);
      
      if (existingPoi.user_id !== userId) {
        const error = new Error('Unauthorized access to this POI');
        error.statusCode = 403;
        throw error;
      }
    } catch (error) {
      if (error.message === 'POI not found') {
        error.statusCode = 404;
      }
      throw error;
    }
    
    // Validate latitude and longitude if provided
    if ((latitude !== undefined && (latitude < -90 || latitude > 90)) ||
        (longitude !== undefined && (longitude < -180 || longitude > 180))) {
      const error = new Error('Invalid latitude or longitude values');
      error.statusCode = 400;
      throw error;
    }
    
    const poiData = {
      name,
      description,
      latitude,
      longitude,
      category,
      is_visited
    };
    
    await POI.update(poiId, poiData);
    const updatedPoi = await POI.findById(poiId);
    
    res.json({
      success: true,
      data: updatedPoi
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a POI
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.delete = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const poiId = req.params.id;
    
    if (!poiId) {
      const error = new Error('POI ID is required');
      error.statusCode = 400;
      throw error;
    }
    
    // Check if POI exists and belongs to user
    try {
      const existingPoi = await POI.findById(poiId);
      
      if (existingPoi.user_id !== userId) {
        const error = new Error('Unauthorized access to this POI');
        error.statusCode = 403;
        throw error;
      }
    } catch (error) {
      if (error.message === 'POI not found') {
        error.statusCode = 404;
      }
      throw error;
    }
    
    await POI.delete(poiId);
    
    res.json({
      success: true,
      message: 'POI deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Find nearby POIs
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.findNearby = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, radius = 5 } = req.query;
    
    // Validate required fields
    if (!latitude || !longitude) {
      const error = new Error('Latitude and longitude are required');
      error.statusCode = 400;
      throw error;
    }
    
    // Convert to numbers
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseFloat(radius);
    
    // Validate latitude and longitude
    if (isNaN(lat) || isNaN(lon) || isNaN(rad) || 
        lat < -90 || lat > 90 || lon < -180 || lon > 180 || rad <= 0) {
      const error = new Error('Invalid latitude, longitude, or radius');
      error.statusCode = 400;
      throw error;
    }
    
    // Get nearby POIs
    const pois = await POI.findNearby(userId, lat, lon, rad);
    
    res.json({
      success: true,
      count: pois.length,
      data: pois
    });
  } catch (error) {
    next(error);
  }
}; 