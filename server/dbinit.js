

/**
 * This module initializes the database for the department inventory system.
 * It handles:
 * - Creating the database if it doesn't exist
 * - Setting up database tables and schema
 * - Loading initial data
 * - Establishing database connections
 * 
 * The initialization process uses environment variables for configuration
 * and executes SQL scripts to create the necessary database structure.
 */


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get current file path and directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Default database connection configuration
 * Uses environment variables with fallbacks
 */
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

/**
 * Initializes the database by:
 * 1. Creating the database if it doesn't exist
 * 2. Creating tables and populating initial data from SQL file
 * 
 * The function performs the following steps:
 * - Creates a temporary connection to MySQL server without selecting a database
 * - Creates the database if it doesn't exist
 * - Establishes a connection pool with the created database
 * - Reads and executes SQL statements from schema file
 * 
 * @throws {Error} If database initialization fails
 */
async function initializeDatabase() {
    // Create temporary connection to MySQL server without database
    const tempConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    try {
        // Create database if it doesn't exist
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log('Database created or already exists');
        
        // Close temporary connection
        await tempConnection.end();

        // Create main connection pool with database
        const mainConnection = await mysql.createPool({
            ...DB_CONFIG,
            database: process.env.DB_NAME
        });

        // Read the schema.sql file containing table definitions and initial data
        const schemaPath = path.join(__dirname, '..', 'extras', 'rawexport.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split the SQL file into individual statements
        const statements = schemaSql
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        // Execute each SQL statement sequentially
        for (const statement of statements) {
            await mainConnection.query(statement);
        }

        console.log('Database initialized successfully');
        
        // Close the main connection pool
        await mainConnection.end();

    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Execute database initialization
initializeDatabase().catch(console.error);
