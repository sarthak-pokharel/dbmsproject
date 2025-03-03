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

// Route to create a new room
router.post('/create', upload.single('image'), async (req, res) => {
    const { label, type, status } = req.body;

    if (!label || !type) {
        return res.status(400).json({ message: 'Required fields (label, type) are missing' });
    }

    // Default status to 'functional' if not provided
    const roomStatus = status || 'functional';

    try {
        const query = 'INSERT INTO room (label, type, status, image_file_id) VALUES (?, ?, ?, ?)';
        const result = await runQuery(query, [label, type, roomStatus, req.file?.filename || null]);

        return res.status(201).json({ message: 'Room created successfully', id: result.insertId });
    } catch (error) {
        // If there was an error and we uploaded a file, try to delete it
        if (req.file) {
            try {
                await fs.promises.unlink(path.join(process.cwd(), 'uploads', req.file.filename));
            } catch (err) {
                console.error('Error cleaning up uploaded file after error:', err);
            }
        }
        console.error('Error creating room:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to edit a room
router.put('/edit/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { label, type, status } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Room ID is required' });
    }

    try {
        // Check if the room exists and get current image
        const checkQuery = 'SELECT id, image_file_id FROM room WHERE id = ?';
        const checkResult = await runQuery(checkQuery, [id]);
        
        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Build the query dynamically based on provided fields
        let updateFields = [];
        let queryParams = [];

        if (label !== undefined) {
            updateFields.push('label = ?');
            queryParams.push(label);
        }
        
        if (type !== undefined) {
            updateFields.push('type = ?');
            queryParams.push(type);
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

        const query = `UPDATE room SET ${updateFields.join(', ')} WHERE id = ?`;
        await runQuery(query, queryParams);

        return res.status(200).json({ message: 'Room updated successfully' });
    } catch (error) {
        // If there was an error and we uploaded a file, try to delete it
        if (req.file) {
            try {
                await fs.promises.unlink(path.join(process.cwd(), 'uploads', req.file.filename));
            } catch (err) {
                console.error('Error cleaning up uploaded file after error:', err);
            }
        }
        console.error('Error updating room:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to delete a room
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Room ID is required' });
    }

    try {
        // First get the room details to check for image and related items
        const checkQuery = 'SELECT image_file_id FROM room WHERE id = ?';
        const checkResult = await runQuery(checkQuery, [id]);

        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if room has any associated lab utilities, computers, or smart boards
        const checkRelatedItems = async (table, foreignKey) => {
            const query = `SELECT COUNT(*) as count FROM ${table} WHERE ${foreignKey} = ?`;
            const result = await runQuery(query, [id]);
            return result[0].count;
        };

        const labUtilityCount = await checkRelatedItems('lab_utility', 'isassignedto');
        const computerCount = await checkRelatedItems('computer', 'isassignedto');
        const smartBoardCount = await checkRelatedItems('smart_board', 'isassignedto');

        if (labUtilityCount > 0 || computerCount > 0 || smartBoardCount > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete room with associated items. Please reassign or delete the related items first.',
                details: {
                    labUtilities: labUtilityCount,
                    computers: computerCount,
                    smartBoards: smartBoardCount
                }
            });
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

        const query = 'DELETE FROM room WHERE id = ?';
        const result = await runQuery(query, [id]);

        return res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get all rooms
router.get('/all', async (req, res) => {
    try {
        const query = 'SELECT * FROM room ORDER BY label';
        const rooms = await runQuery(query);
        return res.status(200).json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get a specific room by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const query = 'SELECT * FROM room WHERE id = ?';
        const result = await runQuery(query, [id]);
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        return res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching room:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get a specific room by ID with all its assets
router.get('/details/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Get room details
        const roomQuery = 'SELECT * FROM room WHERE id = ?';
        const room = await runQuery(roomQuery, [id]);
        
        if (room.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Get computers in the room
        const computersQuery = `
            SELECT c.*, cc.label as category_name 
            FROM computer c 
            LEFT JOIN computer_cat cc ON c.belongstocategory = cc.id 
            WHERE c.isassignedto = ?
        `;
        const computers = await runQuery(computersQuery, [id]);

        // Get lab utilities in the room
        const utilitiesQuery = 'SELECT * FROM lab_utility WHERE isassignedto = ?';
        const utilities = await runQuery(utilitiesQuery, [id]);

        // Get smart boards in the room
        const smartBoardsQuery = 'SELECT * FROM smart_board WHERE isassignedto = ?';
        const smartBoards = await runQuery(smartBoardsQuery, [id]);

        return res.status(200).json({
            room: room[0],
            computers,
            utilities,
            smartBoards
        });
    } catch (error) {
        console.error('Error fetching room details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to upload image for a room
router.post('/upload-image/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    try {
        // Check if the room exists
        const checkQuery = 'SELECT id, image_file_id FROM room WHERE id = ?';
        const checkResult = await runQuery(checkQuery, [id]);
        
        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
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

        // Update the room with the new image file id
        const query = 'UPDATE room SET image_file_id = ? WHERE id = ?';
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

// Route to serve room images
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
