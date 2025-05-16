const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * User Model
 */
class User {
  /**
   * Create a new user
   * @param {object} userData - User data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @returns {Promise<number>} - User ID
   */
  static async create(userData) {
    try {
      const { username, email, password } = userData;
      
      // Check if username or email already exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
      );
      
      if (existingUser.length > 0) {
        const existing = existingUser[0];
        if (existing.username === username) {
          throw new Error('Username already exists');
        } else {
          throw new Error('Email already exists');
        }
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert user
      const result = await db.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 'user']
      );
      
      return result.lastID;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Find a user by ID
   * @param {number} id - User ID
   * @returns {Promise<object>} - User object
   */
  static async findById(id) {
    try {
      const users = await db.query(
        'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      return users[0];
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Find a user by username
   * @param {string} username - Username
   * @returns {Promise<object>} - User object with password
   */
  static async findByUsername(username) {
    try {
      const users = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      return users[0];
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Find a user by email
   * @param {string} email - Email
   * @returns {Promise<object>} - User object with password
   */
  static async findByEmail(email) {
    try {
      const users = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      return users[0];
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update user information
   * @param {number} id - User ID
   * @param {object} userData - User data to update
   * @returns {Promise<object>} - Updated user object
   */
  static async update(id, userData) {
    try {
      const { username, email, password } = userData;
      
      // Start building the query
      let query = 'UPDATE users SET';
      const queryParams = [];
      
      // Add each field if it exists
      if (username) {
        // Check if username already exists for another user
        const existingUsers = await db.query(
          'SELECT id FROM users WHERE username = ? AND id != ?',
          [username, id]
        );
        
        if (existingUsers.length > 0) {
          throw new Error('Username already exists');
        }
        
        query += ' username = ?,';
        queryParams.push(username);
      }
      
      if (email) {
        // Check if email already exists for another user
        const existingUsers = await db.query(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, id]
        );
        
        if (existingUsers.length > 0) {
          throw new Error('Email already exists');
        }
        
        query += ' email = ?,';
        queryParams.push(email);
      }
      
      if (password) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        query += ' password = ?,';
        queryParams.push(hashedPassword);
      }
      
      // Add updated_at field
      query += ' updated_at = CURRENT_TIMESTAMP,';
      
      // Remove trailing comma and add WHERE clause
      query = query.slice(0, -1) + ' WHERE id = ?';
      queryParams.push(id);
      
      // Execute update
      await db.query(query, queryParams);
      
      // Return updated user
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Verify a password against a hashed password
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} - Whether password matches
   */
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;