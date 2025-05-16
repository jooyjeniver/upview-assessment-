const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const util = require('util');

// Create data directory if it doesn't exist
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.resolve(dataDir, 'poi_explorer.db');

// Create and initialize the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
    process.exit(1);
  }
  
  console.log('Connected to SQLite database');
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Create tables
  initializeDatabase();
});

// Initialize database tables
function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table initialized');
      
      // Create POIs table after users table
      createPoisTable();
    }
  });
}

// Create POIs table
function createPoisTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS pois (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      category TEXT DEFAULT 'other',
      is_visited BOOLEAN DEFAULT 0,
      client_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating pois table:', err);
    } else {
      console.log('POIs table initialized');
      
      // Create indexes
      createIndexes();
    }
  });
}

// Create indexes
function createIndexes() {
  // Create index for user_id for faster user-based filtering
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_pois_user_id ON pois (user_id)
  `, (err) => {
    if (err) {
      console.error('Error creating user_id index:', err);
    } else {
      console.log('user_id index created');
    }
  });
  
  // Create index for coordinates for faster geospatial queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_pois_coords ON pois (latitude, longitude)
  `, (err) => {
    if (err) {
      console.error('Error creating coordinates index:', err);
    } else {
      console.log('coordinates index created');
    }
  });
}

// Promisify database methods for async/await usage
db.query = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (sql.trim().toLowerCase().startsWith('select')) {
      this.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    } else {
      this.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    }
  });
};

module.exports = db; 