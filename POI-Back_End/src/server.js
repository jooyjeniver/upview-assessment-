const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize database
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const poiRoutes = require('./routes/pois');
const syncRoutes = require('./routes/sync');
const distanceRoutes = require('./routes/distance');

// Initialize express app
const app = express();

// Set port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // HTTP request logger

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/pois', poiRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/distance', distanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Root route for API check
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to POI Explorer API',
    endpoints: {
      auth: '/api/auth',
      pois: '/api/pois',
      sync: '/api/sync',
      distance: '/api/distance'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
}); 