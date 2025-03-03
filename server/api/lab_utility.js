import express from 'express';
import { runQuery } from './db.js';

const router = express.Router();

// Route to create a new lab utility
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

// Route to edit a lab utility
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

// Route to delete a lab utility
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

// Route to get all lab utilities
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

// Route to get a specific lab utility by ID
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
