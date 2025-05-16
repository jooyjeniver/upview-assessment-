const POI = require('../models/POI');
const { calculateDistance } = require('../utils/haversine');

/**
 * Calculate distance between two POIs
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.getDistance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { poiId1, poiId2 } = req.body;
    
    // Validate request
    if (!poiId1 || !poiId2) {
      const error = new Error('Two POI IDs are required');
      error.statusCode = 400;
      throw error;
    }
    
    // Get both POIs
    let poi1, poi2;
    
    try {
      poi1 = await POI.findById(poiId1);
      
      if (poi1.user_id !== userId) {
        const error = new Error('Unauthorized access to POI 1');
        error.statusCode = 403;
        throw error;
      }
    } catch (error) {
      if (error.message === 'POI not found') {
        error.message = 'POI 1 not found';
        error.statusCode = 404;
      }
      throw error;
    }
    
    try {
      poi2 = await POI.findById(poiId2);
      
      if (poi2.user_id !== userId) {
        const error = new Error('Unauthorized access to POI 2');
        error.statusCode = 403;
        throw error;
      }
    } catch (error) {
      if (error.message === 'POI not found') {
        error.message = 'POI 2 not found';
        error.statusCode = 404;
      }
      throw error;
    }
    
    // Calculate distance
    const distance = calculateDistance(
      poi1.latitude,
      poi1.longitude,
      poi2.latitude,
      poi2.longitude
    );
    
    res.json({
      success: true,
      data: {
        poi1: {
          id: poi1.id,
          name: poi1.name,
          latitude: poi1.latitude,
          longitude: poi1.longitude
        },
        poi2: {
          id: poi2.id,
          name: poi2.name,
          latitude: poi2.latitude,
          longitude: poi2.longitude
        },
        distance,
        unit: 'kilometers'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate distance between two coordinate pairs
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.getCoordinateDistance = async (req, res, next) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.body;
    
    // Validate request
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
      const error = new Error('Two coordinate pairs (lat1, lon1, lat2, lon2) are required');
      error.statusCode = 400;
      throw error;
    }
    
    // Convert to numbers
    const latitude1 = parseFloat(lat1);
    const longitude1 = parseFloat(lon1);
    const latitude2 = parseFloat(lat2);
    const longitude2 = parseFloat(lon2);
    
    // Validate coordinates
    if (isNaN(latitude1) || isNaN(longitude1) || isNaN(latitude2) || isNaN(longitude2) ||
        latitude1 < -90 || latitude1 > 90 || longitude1 < -180 || longitude1 > 180 ||
        latitude2 < -90 || latitude2 > 90 || longitude2 < -180 || longitude2 > 180) {
      const error = new Error('Invalid coordinate values');
      error.statusCode = 400;
      throw error;
    }
    
    // Calculate distance
    const distance = calculateDistance(
      latitude1,
      longitude1,
      latitude2,
      longitude2
    );
    
    res.json({
      success: true,
      data: {
        point1: {
          latitude: latitude1,
          longitude: longitude1
        },
        point2: {
          latitude: latitude2,
          longitude: longitude2
        },
        distance,
        unit: 'kilometers'
      }
    });
  } catch (error) {
    next(error);
  }
}; 