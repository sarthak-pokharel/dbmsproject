import express from 'express';
import { runQuery } from './db.js'; // Importing the runQuery function

const router = express.Router();

router.post('/create', async (req, res) => {
    const { label, install_date, isassignedto, belongstocategory, status, quantity } = req.body;
    if (!label || !isassignedto || !belongstocategory || !status) {
        return res.status(400).json({ message: 'label, isassignedto, belongstocategory, and status are required' });
    }

    try {
        // Check if the room exists
        const roomCheck = await runQuery('SELECT id FROM room WHERE id = ?', [isassignedto]);
        if (roomCheck.length === 0) {
            return res.status(400).json({ message: 'Assigned room does not exist' });
        }

        // Check if the category exists
        const categoryCheck = await runQuery('SELECT id FROM computer_cat WHERE id = ?', [belongstocategory]);
        if (categoryCheck.length === 0) {
            return res.status(400).json({ message: 'Computer category does not exist' });
        }

        const query = 'INSERT INTO computer (label, install_date, isassignedto, belongstocategory, status, quantity) VALUES (?, ?, ?, ?, ?, ?)';
        const result = await runQuery(query, [label, install_date, isassignedto, belongstocategory, status, quantity || 1]);

        return res.status(201).json({ message: 'New computer added', id: result.insertId });
    } catch (error) {
        console.error('Error creating computer:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
// Route to edit a computer
router.put('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { install_date, isassignedto, belongstocategory, status, quantity } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Computer ID is required' });
    }

    try {
        // Build the query dynamically based on provided fields
        let updateFields = [];
        let queryParams = [];

        if (install_date !== undefined) {
            updateFields.push('install_date = ?');
            queryParams.push(install_date);
        }
        
        if (isassignedto !== undefined) {
            updateFields.push('isassignedto = ?');
            queryParams.push(isassignedto);
        }
        
        if (belongstocategory !== undefined) {
            updateFields.push('belongstocategory = ?');
            queryParams.push(belongstocategory);
        }
        
        if (status !== undefined) {
            updateFields.push('status = ?');
            queryParams.push(status);
        }

        if (quantity !== undefined) {
            updateFields.push('quantity = ?');
            queryParams.push(quantity);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Add the ID to the query parameters
        queryParams.push(id);

        const query = `UPDATE computer SET ${updateFields.join(', ')} WHERE id = ?`;
        const result = await runQuery(query, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Computer not found' });
        }

        return res.status(200).json({ message: 'Computer updated successfully' });
    } catch (error) {
        console.error('Error updating computer:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to delete a computer
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Computer ID is required' });
    }

    try {
        const query = 'DELETE FROM computer WHERE id = ?';
        const result = await runQuery(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Computer not found' });
        }

        return res.status(200).json({ message: 'Computer deleted successfully' });
    } catch (error) {
        console.error('Error deleting computer:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// Route to get all computers
router.get('/all', async (req, res) => {
    try {
        const query = 'SELECT * FROM computer ORDER BY id';
        const computers = await runQuery(query);
        return res.status(200).json(computers);
    } catch (error) {
        console.error('Error fetching computers:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get a specific computer by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const query = 'SELECT * FROM computer WHERE id = ?';
        const result = await runQuery(query, [id]);
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Computer not found' });
        }
        
        return res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching computer:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;
