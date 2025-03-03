import express from 'express';
import { runQuery } from './db.js';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const fileHash = crypto.randomBytes(16).toString('hex');
        const extension = path.extname(file.originalname);
        cb(null, `${fileHash}${extension}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Route to create a new smart board
router.post('/create', async (req, res) => {
    const { model_id, room_id, status } = req.body;

    if (!model_id || !room_id || !status) {
        return res.status(400).json({ message: 'model_id, room_id, and status are required' });
    }

    try {
        // Check if the assigned room exists
        const roomCheckQuery = 'SELECT id FROM room WHERE id = ?';
        const roomResult = await runQuery(roomCheckQuery, [room_id]);
        
        if (roomResult.length === 0) {
            return res.status(400).json({ message: 'The specified room does not exist' });
        }

        const installed_date = new Date().toISOString().split('T')[0]; // Set current date as installation date
        const query = 'INSERT INTO smart_board (model_id, isassignedto, installed_date, status) VALUES (?, ?, ?, ?)';
        const result = await runQuery(query, [model_id, room_id, installed_date, status]);

        // Fetch the created smart board with room details
        const newBoardQuery = `
            SELECT s.*, r.label as room_name 
            FROM smart_board s
            JOIN room r ON s.isassignedto = r.id
            WHERE s.id = ?
        `;
        const newBoard = await runQuery(newBoardQuery, [result.insertId]);

        return res.status(201).json({
            message: 'New smart board added',
            data: newBoard[0]
        });
    } catch (error) {
        console.error('Error creating smart board:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to edit a smart board
router.put('/edit/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { model_id, room_id, status } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Smart board ID is required' });
    }

    try {
        // Check if the smart board exists
        const checkQuery = 'SELECT id, image_file_id FROM smart_board WHERE id = ?';
        const checkResult = await runQuery(checkQuery, [id]);
        
        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Smart board not found' });
        }

        // If room assignment is being updated, check if the room exists
        if (room_id !== undefined) {
            const roomCheckQuery = 'SELECT id FROM room WHERE id = ?';
            const roomResult = await runQuery(roomCheckQuery, [room_id]);
            
            if (roomResult.length === 0) {
                return res.status(400).json({ message: 'The specified room does not exist' });
            }
        }

        // Build the query dynamically based on provided fields
        let updateFields = [];
        let queryParams = [];

        if (model_id !== undefined) {
            updateFields.push('model_id = ?');
            queryParams.push(model_id);
        }
        
        if (room_id !== undefined) {
            updateFields.push('isassignedto = ?');
            queryParams.push(room_id);
        }
        
        if (status !== undefined) {
            updateFields.push('status = ?');
            queryParams.push(status);
        }

        // Handle image upload if present
        if (req.file) {
            updateFields.push('image_file_id = ?');
            queryParams.push(req.file.filename);

            // Delete old image if it exists
            const oldImage = checkResult[0].image_file_id;
            if (oldImage) {
                const oldImagePath = path.join(process.cwd(), 'uploads', oldImage);
                try {
                    await fs.promises.unlink(oldImagePath);
                } catch (err) {
                    console.error('Error deleting old image:', err);
                    // Continue with update even if old image deletion fails
                }
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Add the ID to the query parameters
        queryParams.push(id);

        const query = `UPDATE smart_board SET ${updateFields.join(', ')} WHERE id = ?`;
        await runQuery(query, queryParams);

        // Fetch the updated smart board with room details
        const updatedBoardQuery = `
            SELECT s.*, r.label as room_name 
            FROM smart_board s
            JOIN room r ON s.isassignedto = r.id
            WHERE s.id = ?
        `;
        const updatedBoard = await runQuery(updatedBoardQuery, [id]);

        return res.status(200).json({
            message: 'Smart board updated successfully',
            data: updatedBoard[0]
        });
    } catch (error) {
        // If there was an error and we uploaded a new image, try to delete it
        if (req.file) {
            try {
                await fs.promises.unlink(path.join(process.cwd(), 'uploads', req.file.filename));
            } catch (err) {
                console.error('Error cleaning up uploaded file after error:', err);
            }
        }
        console.error('Error updating smart board:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to delete a smart board
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Smart board ID is required' });
    }

    try {
        // First get the smart board details to check for image
        const checkQuery = 'SELECT image_file_id FROM smart_board WHERE id = ?';
        const checkResult = await runQuery(checkQuery, [id]);

        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Smart board not found' });
        }

        // Delete the image file if it exists
        const imageFileId = checkResult[0].image_file_id;
        if (imageFileId) {
            const imagePath = path.join(process.cwd(), 'uploads', imageFileId);
            try {
                await fs.promises.unlink(imagePath);
            } catch (err) {
                console.error('Error deleting image file:', err);
                // Continue with deletion even if image deletion fails
            }
        }

        // Delete the smart board record
        const query = 'DELETE FROM smart_board WHERE id = ?';
        const result = await runQuery(query, [id]);

        return res.status(200).json({ message: 'Smart board deleted successfully' });
    } catch (error) {
        console.error('Error deleting smart board:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get all smart boards
router.get('/all', async (req, res) => {
    try {
        const query = `
            SELECT s.*, r.label as room_name 
            FROM smart_board s
            JOIN room r ON s.isassignedto = r.id
            ORDER BY s.model_id
        `;
        const smartBoards = await runQuery(query);
        return res.status(200).json(smartBoards);
    } catch (error) {
        console.error('Error fetching smart boards:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get a specific smart board by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const query = `
            SELECT s.*, r.label as room_name 
            FROM smart_board s
            JOIN room r ON s.isassignedto = r.id
            WHERE s.id = ?
        `;
        const result = await runQuery(query, [id]);
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Smart board not found' });
        }
        
        return res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching smart board:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to upload image for a smart board
router.post('/upload-image/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    try {
        // Check if the smart board exists
        const checkQuery = 'SELECT id, image_file_id FROM smart_board WHERE id = ?';
        const checkResult = await runQuery(checkQuery, [id]);
        
        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Smart board not found' });
        }

        // Delete old image if it exists
        const oldImage = checkResult[0].image_file_id;
        if (oldImage) {
            const oldImagePath = path.join(process.cwd(), 'uploads', oldImage);
            try {
                await fs.promises.unlink(oldImagePath);
            } catch (err) {
                console.error('Error deleting old image:', err);
                // Continue with update even if old image deletion fails
            }
        }

        // Update the smart board with the new image file id
        const query = 'UPDATE smart_board SET image_file_id = ? WHERE id = ?';
        await runQuery(query, [req.file.filename, id]);

        return res.status(200).json({
            message: 'Image uploaded successfully',
            filename: req.file.filename
        });
    } catch (error) {
        // If there was an error, try to delete the uploaded file
        if (req.file) {
            try {
                await fs.promises.unlink(path.join(process.cwd(), 'uploads', req.file.filename));
            } catch (err) {
                console.error('Error cleaning up uploaded file after error:', err);
            }
        }
        console.error('Error uploading image:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to serve smart board images
router.get('/image/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(404).json({ message: 'Image not found' });
        }
    });
});

export default router;
