import express from 'express';
import { runQuery } from './db.js'; // Importing the runQuery function

const router = express.Router();

// Login route
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

// Registration route
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

// Route to get user info
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

// Route to update user info
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