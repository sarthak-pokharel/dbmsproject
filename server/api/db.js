import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration constants
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bctinventory',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Initialize database connection
const dbcon = mysql.createPool(DB_CONFIG);

/**
 * Executes a database query with optional parameters
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters (default empty array)
 * @returns {Promise} Query results
 */
async function runQuery(query, params = []) {
  try {
    const [results] = await dbcon.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database error:', error);
    console.error('Query:', query);
    console.error('Parameters:', params);
    throw error;
  }
}

export { dbcon, runQuery };
