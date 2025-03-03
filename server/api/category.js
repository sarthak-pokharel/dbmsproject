import express from 'express';
import { runQuery } from './db.js';

const router = express.Router();

// Route to create a new computer category
router.post('/create', async (req, res) => {
    const { label, model_release_date, description } = req.body;

    if (!label || !model_release_date || !description) {
        return res.status(400).json({ message: 'Label, model release date, and description are required' });
    }

    try {
        const query = 'INSERT INTO computer_cat (label, model_release_date, description) VALUES (?, ?, ?)';
        const result = await runQuery(query, [label, model_release_date, description]);

        return res.status(201).json({ message: 'New computer category added', id: result.insertId });
    } catch (error) {
        console.error('Error creating computer category:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to edit a computer category
router.put('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { label, model_release_date, description } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Computer category ID is required' });
    }

    try {
        // Check if the category exists
        const checkQuery = 'SELECT id FROM computer_cat WHERE id = ?';
        const checkResult = await runQuery(checkQuery, [id]);
        
        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Computer category not found' });
        }

        // Build the query dynamically based on provided fields
        let updateFields = [];
        let queryParams = [];

        if (label !== undefined) {
            updateFields.push('label = ?');
            queryParams.push(label);
        }
        
        if (model_release_date !== undefined) {
            updateFields.push('model_release_date = ?');
            queryParams.push(model_release_date);
        }

        if (description !== undefined) {
            updateFields.push('description = ?');
            queryParams.push(description);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Add the ID to the query parameters
        queryParams.push(id);

        const query = `UPDATE computer_cat SET ${updateFields.join(', ')} WHERE id = ?`;
        const result = await runQuery(query, queryParams);

        return res.status(200).json({ message: 'Computer category updated successfully' });
    } catch (error) {
        console.error('Error updating computer category:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to delete a computer category
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Computer category ID is required' });
    }

    try {
        // Check if there are computers using this category
        const checkQuery = 'SELECT COUNT(*) as count FROM computer WHERE belongstocategory = ?';
        const checkResult = await runQuery(checkQuery, [id]);
        
        if (checkResult[0].count > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete category because it is being used by computers' 
            });
        }

        const query = 'DELETE FROM computer_cat WHERE id = ?';
        const result = await runQuery(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Computer category not found' });
        }

        return res.status(200).json({ message: 'Computer category deleted successfully' });
    } catch (error) {
        console.error('Error deleting computer category:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get all computer categories
router.get('/all', async (req, res) => {
    try {
        const query = 'SELECT * FROM computer_cat ORDER BY label';
        const categories = await runQuery(query);
        return res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching computer categories:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get a specific computer category by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const query = 'SELECT * FROM computer_cat WHERE id = ?';
        const result = await runQuery(query, [id]);
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Computer category not found' });
        }
        
        return res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching computer category:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get computers by category
router.get('/:id/computers', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if category exists
        const categoryQuery = 'SELECT * FROM computer_cat WHERE id = ?';
        const categoryResult = await runQuery(categoryQuery, [id]);
        
        if (categoryResult.length === 0) {
            return res.status(404).json({ message: 'Computer category not found' });
        }
        
        // Get all computers in this category
        const query = `
            SELECT c.*, r.label as room_name 
            FROM computer c
            JOIN room r ON c.isassignedto = r.id
            WHERE c.belongstocategory = ?
            ORDER BY c.hostname
        `;
        const computers = await runQuery(query, [id]);
        
        return res.status(200).json({
            category: categoryResult[0],
            computers: computers
        });
    } catch (error) {
        console.error('Error fetching computers by category:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
