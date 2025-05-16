const db = require('../config/database');
const { calculateDistance } = require('../utils/haversine');

/**
 * POI (Point of Interest) Model
 */
class POI {
  /**
   * Create a new POI
   * @param {object} poiData - POI data
   * @returns {Promise<number>} - POI ID
   */
  static async create(poiData) {
    try {
      const {
        user_id,
        name,
        description = '',
        latitude,
        longitude,
        category = 'other',
        is_visited = false,
        client_id = null
      } = poiData;
      
      const result = await db.query(
        `INSERT INTO pois (
          user_id, name, description, latitude, longitude, 
          category, is_visited, client_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id, 
          name, 
          description, 
          latitude, 
          longitude, 
          category, 
          is_visited ? 1 : 0, 
          client_id
        ]
      );
      
      return result.lastID;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Find a POI by ID
   * @param {number} id - POI ID
   * @returns {Promise<object>} - POI object
   */
  static async findById(id) {
    try {
      const pois = await db.query(
        'SELECT * FROM pois WHERE id = ?',
        [id]
      );
      
      if (pois.length === 0) {
        throw new Error('POI not found');
      }
      
      const poi = pois[0];
      
      // Convert is_visited from integer to boolean
      poi.is_visited = poi.is_visited === 1;
      
      return poi;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Find all POIs for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of POI objects
   */
  static async findAllByUser(userId) {
    try {
      const pois = await db.query(
        'SELECT * FROM pois WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      // Convert is_visited from integer to boolean for each POI
      return pois.map(poi => ({
        ...poi,
        is_visited: poi.is_visited === 1
      }));
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update a POI
   * @param {number} id - POI ID
   * @param {object} poiData - POI data to update
   * @returns {Promise<void>}
   */
  static async update(id, poiData) {
    try {
      const {
        name,
        description,
        latitude,
        longitude,
        category,
        is_visited
      } = poiData;
      
      // Build query and parameters dynamically
      let query = 'UPDATE pois SET';
      const queryParams = [];
      
      // Add each field if it exists
      if (name !== undefined) {
        query += ' name = ?,';
        queryParams.push(name);
      }
      
      if (description !== undefined) {
        query += ' description = ?,';
        queryParams.push(description);
      }
      
      if (latitude !== undefined) {
        query += ' latitude = ?,';
        queryParams.push(latitude);
      }
      
      if (longitude !== undefined) {
        query += ' longitude = ?,';
        queryParams.push(longitude);
      }
      
      if (category !== undefined) {
        query += ' category = ?,';
        queryParams.push(category);
      }
      
      if (is_visited !== undefined) {
        query += ' is_visited = ?,';
        queryParams.push(is_visited ? 1 : 0);
      }
      
      // Add updated_at field
      query += ' updated_at = CURRENT_TIMESTAMP,';
      
      // Remove trailing comma and add WHERE clause
      query = query.slice(0, -1) + ' WHERE id = ?';
      queryParams.push(id);
      
      // Execute update
      const result = await db.query(query, queryParams);
      
      if (result.changes === 0) {
        throw new Error('POI not found or no changes made');
      }
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Delete a POI
   * @param {number} id - POI ID
   * @returns {Promise<void>}
   */
  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM pois WHERE id = ?',
        [id]
      );
      
      if (result.changes === 0) {
        throw new Error('POI not found');
      }
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Find POIs within a radius
   * @param {number} userId - User ID
   * @param {number} latitude - Center latitude
   * @param {number} longitude - Center longitude
   * @param {number} radiusKm - Radius in kilometers
   * @returns {Promise<Array>} - Array of POI objects
   */
  static async findNearby(userId, latitude, longitude, radiusKm) {
    try {
      // First get all POIs for the user
      const pois = await this.findAllByUser(userId);
      
      // Filter POIs based on distance using the Haversine formula
      const nearbyPois = pois.filter(poi => {
        const distance = calculateDistance(
          latitude,
          longitude,
          poi.latitude,
          poi.longitude
        );
        
        // Add the distance to the POI object for reference
        poi.distance = distance;
        
        // Return POIs within the specified radius
        return distance <= radiusKm;
      });
      
      // Sort by distance (closest first)
      return nearbyPois.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = POI; 