const POI = require('../models/POI');

/**
 * Synchronize POIs from client to server
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.syncPois = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { pois } = req.body;
    
    // Validate request
    if (!pois || !Array.isArray(pois)) {
      const error = new Error('POIs must be provided as an array');
      error.statusCode = 400;
      throw error;
    }
    
    // Get all existing POIs for the user
    const existingPois = await POI.findAllByUser(userId);
    const existingPoisMap = existingPois.reduce((map, poi) => {
      map[poi.id] = poi;
      return map;
    }, {});
    
    // Process POIs for create, update, and delete operations
    const toCreate = [];
    const toUpdate = [];
    const toDelete = [];
    const syncErrors = [];
    
    // Identify POIs to create or update
    for (const poi of pois) {
      // Validate POI object
      if (!poi.name || poi.latitude === undefined || poi.longitude === undefined) {
        syncErrors.push({
          poi,
          error: 'Name, latitude, and longitude are required'
        });
        continue;
      }
      
      // Validate latitude and longitude
      if (poi.latitude < -90 || poi.latitude > 90 || 
          poi.longitude < -180 || poi.longitude > 180) {
        syncErrors.push({
          poi,
          error: 'Invalid latitude or longitude values'
        });
        continue;
      }
      
      const poiData = {
        name: poi.name,
        description: poi.description || '',
        latitude: poi.latitude,
        longitude: poi.longitude,
        category: poi.category || 'other',
        is_visited: poi.is_visited || false,
        user_id: userId,
        client_id: poi.client_id || null
      };
      
      if (poi.id && existingPoisMap[poi.id]) {
        // Update existing POI
        poiData.id = poi.id;
        toUpdate.push(poiData);
      } else {
        // Create new POI
        toCreate.push(poiData);
      }
    }
    
    // Process deletions - any POI not in the sync request but in the database
    const syncPoiIds = pois.map(poi => poi.id).filter(id => id);
    for (const existingPoi of existingPois) {
      if (!syncPoiIds.includes(existingPoi.id)) {
        toDelete.push(existingPoi.id);
      }
    }
    
    // Execute operations
    const created = [];
    const updated = [];
    const deleted = [];
    
    // Create new POIs
    for (const poiData of toCreate) {
      try {
        const poiId = await POI.create(poiData);
        const newPoi = await POI.findById(poiId);
        created.push(newPoi);
      } catch (error) {
        syncErrors.push({
          poi: poiData,
          error: error.message
        });
      }
    }
    
    // Update existing POIs
    for (const poiData of toUpdate) {
      try {
        await POI.update(poiData.id, poiData);
        const updatedPoi = await POI.findById(poiData.id);
        updated.push(updatedPoi);
      } catch (error) {
        syncErrors.push({
          poi: poiData,
          error: error.message
        });
      }
    }
    
    // Delete POIs
    for (const poiId of toDelete) {
      try {
        await POI.delete(poiId);
        deleted.push(poiId);
      } catch (error) {
        syncErrors.push({
          poiId,
          error: error.message
        });
      }
    }
    
    // Get all POIs after sync
    const allPois = await POI.findAllByUser(userId);
    
    res.json({
      success: true,
      sync_summary: {
        created: created.length,
        updated: updated.length,
        deleted: deleted.length,
        errors: syncErrors.length
      },
      data: {
        pois: allPois,
        created,
        updated,
        deleted,
        errors: syncErrors
      }
    });
  } catch (error) {
    next(error);
  }
}; 