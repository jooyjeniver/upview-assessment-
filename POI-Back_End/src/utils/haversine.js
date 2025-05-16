/**
 * Calculate the great-circle distance between two points on Earth
 * using the Haversine formula.
 * 
 * @param {number} lat1 - Latitude of the first point in decimal degrees
 * @param {number} lon1 - Longitude of the first point in decimal degrees
 * @param {number} lat2 - Latitude of the second point in decimal degrees
 * @param {number} lon2 - Longitude of the second point in decimal degrees
 * @returns {number} Distance between the points in kilometers
 */
exports.calculateDistance = function(lat1, lon1, lat2, lon2) {
  // Convert latitude and longitude to numbers if they're strings
  lat1 = typeof lat1 === 'string' ? parseFloat(lat1) : lat1;
  lon1 = typeof lon1 === 'string' ? parseFloat(lon1) : lon1;
  lat2 = typeof lat2 === 'string' ? parseFloat(lat2) : lat2;
  lon2 = typeof lon2 === 'string' ? parseFloat(lon2) : lon2;
  
  // Radius of the Earth in kilometers
  const R = 6371;
  
  // Convert latitude and longitude from degrees to radians
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  // Haversine formula
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
};

/**
 * Convert degrees to radians
 * 
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
} 