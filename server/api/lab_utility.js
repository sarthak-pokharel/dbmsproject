/**
 * @swagger
 * tags:
 *   name: Lab Utilities
 *   description: Laboratory equipment and utility management endpoints
 */

import express from 'express';
import { runQuery } from './db.js';

/**
 * Express router to mount lab utility related functions on.
 * @type {object}
 * @const
 */
const router = express.Router();

/**
 * Create a new lab utility
 * @route POST /api/lab-utility/create
 * @param {object} req.body - Lab utility creation payload
 * @param {string} req.body.label - Name/identifier of the lab utility
 * @param {string} req.body.description - Detailed description of the utility
 * @param {number} req.body.quantity - Number of units available
 * @param {number} req.body.isassignedto - Room ID where utility is assigned
 * @param {string} req.body.status - Current status of the utility
 * @returns {object} 201 - Created lab utility object
 * @throws {object} 400 - Missing required fields or invalid room
 * @throws {object} 500 - Server error
 */
router.post('/create', async (req, res) => {
    const { label, description, quantity, isassignedto, status } = req.body;

    if (!label || !description || !quantity || !isassignedto || !status) {
        return res.status(400).json({ message: 'All fields (label, description, quantity, isassignedto, status) are required' });
    }

    try {
        // Check if the assigned room exists
        const roomCheckQuery = 'SELECT id FROM room WHERE id = ?';
        const roomResult = await runQuery(roomCheckQuery, [isassignedto]);
        
        if (roomResult.length === 0) {
            return res.status(400).json({ message: 'The specified room does not exist' });
        }

        const query = 'INSERT INTO lab_utility (label, description, quantity, isassignedto, status) VALUES (?, ?, ?, ?, ?)';
        const result = await runQuery(query, [label, description, quantity, isassignedto, status]);

        return res.status(201).json({ message: 'New lab utility added', id: result.insertId });
    } catch (error) {
        console.error('Error creating lab utility:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Update an existing lab utility
 * @route PUT /api/lab-utility/edit/{id}
 * @param {number} req.params.id - Lab utility ID to update
 * @param {object} req.body - Lab utility update payload
 * @param {string} [req.body.label] - New name/identifier
 * @param {string} [req.body.description] - New description
 * @param {number} [req.body.quantity] - New quantity
 * @param {number} [req.body.isassignedto] - New room assignment ID
 * @param {string} [req.body.status] - New status
 * @returns {object} 200 - Success message
 * @throws {object} 400 - Invalid input or room
 * @throws {object} 404 - Lab utility not found
 * @throws {object} 500 - Server error
 */
router.put('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { label, description, quantity, isassignedto, status } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Lab utility ID is required' });
    }

    try {
        // Check if the lab utility exists
        const checkQuery = 'SELECT id FROM lab_utility WHERE id = ?';
        const checkResult = await runQuery(checkQuery, [id]);
        
        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Lab utility not found' });
        }

        // If room assignment is being updated, check if the room exists
        if (isassignedto !== undefined) {
            const roomCheckQuery = 'SELECT id FROM room WHERE id = ?';
            const roomResult = await runQuery(roomCheckQuery, [isassignedto]);
            
            if (roomResult.length === 0) {
                return res.status(400).json({ message: 'The specified room does not exist' });
            }
        }

        // Build the query dynamically based on provided fields
        let updateFields = [];
        let queryParams = [];

        if (label !== undefined) {
            updateFields.push('label = ?');
            queryParams.push(label);
        }
        
        if (description !== undefined) {
            updateFields.push('description = ?');
            queryParams.push(description);
        }
        
        if (quantity !== undefined) {
            updateFields.push('quantity = ?');
            queryParams.push(quantity);
        }
        
        if (isassignedto !== undefined) {
            updateFields.push('isassignedto = ?');
            queryParams.push(isassignedto);
        }
        
        if (status !== undefined) {
            updateFields.push('status = ?');
            queryParams.push(status);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Add the ID to the query parameters
        queryParams.push(id);

        const query = `UPDATE lab_utility SET ${updateFields.join(', ')} WHERE id = ?`;
        const result = await runQuery(query, queryParams);

        return res.status(200).json({ message: 'Lab utility updated successfully' });
    } catch (error) {
        console.error('Error updating lab utility:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Delete a lab utility
 * @route DELETE /api/lab-utility/delete/{id}
 * @param {number} req.params.id - Lab utility ID to delete
 * @returns {object} 200 - Success message
 * @throws {object} 404 - Lab utility not found
 * @throws {object} 500 - Server error
 */
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Lab utility ID is required' });
    }

    try {
        const query = 'DELETE FROM lab_utility WHERE id = ?';
        const result = await runQuery(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Lab utility not found' });
        }

        return res.status(200).json({ message: 'Lab utility deleted successfully' });
    } catch (error) {
        console.error('Error deleting lab utility:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Get all lab utilities
 * @route GET /api/lab-utility/all
 * @returns {Array<object>} 200 - List of all lab utilities with room information
 * @throws {object} 500 - Server error
 */
router.get('/all', async (req, res) => {
    try {
        const query = `
            SELECT l.*, r.label as room_name 
            FROM lab_utility l
            JOIN room r ON l.isassignedto = r.id
            ORDER BY l.label
        `;
        const utilities = await runQuery(query);
        return res.status(200).json(utilities);
    } catch (error) {
        console.error('Error fetching lab utilities:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Get a specific lab utility by ID
 * @route GET /api/lab-utility/{id}
 * @param {number} req.params.id - Lab utility ID to fetch
 * @returns {object} 200 - Lab utility object with room information
 * @throws {object} 404 - Lab utility not found
 * @throws {object} 500 - Server error
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const query = `
            SELECT l.*, r.label as room_name 
            FROM lab_utility l
            JOIN room r ON l.isassignedto = r.id
            WHERE l.id = ?
        `;
        const result = await runQuery(query, [id]);
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Lab utility not found' });
        }
        
        return res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching lab utility:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
