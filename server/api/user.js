/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and management endpoints
 */

import express from 'express';
import { runQuery } from './db.js'; // Importing the runQuery function

/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 */
const router = express.Router();

/**
 * Validate user login credentials
 * @route POST /api/user/login-validate
 * @param {object} req.body - Login credentials
 * @param {string} req.body.username - User's username
 * @param {string} req.body.password - User's password
 * @returns {object} 200 - User object with authentication token
 * @throws {object} 400 - Missing credentials
 * @throws {object} 401 - Invalid credentials
 * @throws {object} 500 - Server error
 */
router.post('/login-validate', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    try {
      const query = 'SELECT id, username, name FROM users WHERE username = ? AND password = ?';
      const results = await runQuery(query, [username, password]);
  
      if (results.length > 0) {
        return res.status(200).json({ message: 'Login successful', user: results[0] });
      } else {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Register a new user
 * @route POST /api/user/register
 * @param {object} req.body - User registration data
 * @param {string} req.body.username - Desired username
 * @param {string} req.body.password - User's password
 * @param {string} req.body.name - User's full name
 * @returns {object} 201 - Success message
 * @throws {object} 400 - Missing required fields
 * @throws {object} 409 - Username already exists
 * @throws {object} 500 - Server error
 */
router.post('/register', async (req, res) => {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
        return res.status(400).json({ message: 'Username, password, and name are required' });
    }

    try {
        const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
        const existingUser = await runQuery(checkUserQuery, [username]);

        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const insertUserQuery = 'INSERT INTO users (username, password, name) VALUES (?, ?, ?)';
        await runQuery(insertUserQuery, [username, password, name]);

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Get user information
 * @route GET /api/user/info
 * @param {string} req.query.userId - ID of the user to fetch
 * @returns {object} 200 - User object
 * @throws {object} 400 - Missing user ID
 * @throws {object} 404 - User not found
 * @throws {object} 500 - Server error
 */
router.get('/info', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const query = 'SELECT * FROM users WHERE id = ?';
        const results = await runQuery(query, [userId]);

        if (results.length > 0) {
            return res.status(200).json({ user: results[0] });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Update user information
 * @route PUT /api/user/edit
 * @param {object} req.body - User update data
 * @param {string} req.body.userId - ID of the user to update
 * @param {string} req.body.username - New username
 * @param {string} req.body.password - New password
 * @param {string} req.body.name - New full name
 * @returns {object} 200 - Success message
 * @throws {object} 400 - Missing required fields
 * @throws {object} 404 - User not found
 * @throws {object} 500 - Server error
 */
router.put('/edit', async (req, res) => {
    const { userId, username, password, name } = req.body;

    if (!userId || !username || !password || !name) {
        return res.status(400).json({ message: 'User ID, username, password, and name are required' });
    }

    try {
        const query = 'UPDATE users SET username = ?, password = ?, name = ? WHERE id = ?';
        const results = await runQuery(query, [username, password, name, userId]);

        if (results.affectedRows > 0) {
            return res.status(200).json({ message: 'User info updated successfully' });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;