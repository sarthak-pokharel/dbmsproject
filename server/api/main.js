import express from 'express';
import {dbcon, runQuery} from './db.js';
import userRouter from './user.js';
import computerRouter from './computer.js';
import labUtilityRouter from './lab_utility.js';
import roomRouter from './room.js';
import categoryRouter from './category.js';
import smartBoardRouter from './smart_board.js';
import dashboardRouter from './dashboard.js';

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *   - name: Computers
 *   - name: Lab Utilities
 *   - name: Rooms
 *   - name: Categories
 *   - name: Smart Boards
 *   - name: Dashboard
 */

/**
 * Main API Router
 * 
 * This module serves as the central router for the BCT Inventory Management System API.
 * It consolidates all route handlers for various resources into a single, organized routing system.
 * 
 * @module MainRouter
 * @version 1.0.0
 */
const router = express.Router();

/**
 * Root API endpoint - Health check
 * 
 * @route   GET /api
 * @desc    Simple endpoint to verify API is functioning
 * @access  Public
 * @returns {Object} Message indicating API status
 */
router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

/**
 * Authentication Routes (/api/user)
 * @route /api/user
 * @desc Authentication and user management endpoints
 * 
 * Available endpoints:
 * POST /api/user/login-validate - Validate user credentials
 *   @body {string} username - User's username
 *   @body {string} password - User's password
 *   @returns {Object} User data and authentication status
 */
router.use('/user', userRouter);

/**
 * Computer Management Routes (/api/computer)
 * @route /api/computer
 * @desc Computer inventory management endpoints
 * 
 * Available endpoints:
 * POST   /api/computer/create-new-computer - Create a new computer entry
 * PUT    /api/computer/edit/:id - Update an existing computer
 * DELETE /api/computer/delete/:id - Remove a computer
 * GET    /api/computer/all - List all computers
 * GET    /api/computer/:id - Get specific computer details
 */
router.use('/computer', computerRouter);

/**
 * Lab Utility Routes (/api/lab-utility)
 * @route /api/lab-utility
 * @desc Laboratory equipment and utility management endpoints
 * 
 * Available endpoints:
 * POST   /api/lab-utility/create-lab-utility - Create new lab utility
 * PUT    /api/lab-utility/edit/:id - Update existing utility
 * DELETE /api/lab-utility/delete/:id - Remove a utility
 * GET    /api/lab-utility/all - List all utilities
 * GET    /api/lab-utility/:id - Get specific utility details
 */
router.use('/lab-utility', labUtilityRouter);

/**
 * Room Management Routes (/api/room)
 * @route /api/room
 * @desc Room and location management endpoints
 * 
 * Available endpoints:
 * POST   /api/room/create - Create new room
 * PUT    /api/room/edit/:id - Update room details
 * DELETE /api/room/delete/:id - Remove a room
 * GET    /api/room/all - List all rooms
 * GET    /api/room/:id - Get specific room details
 */
router.use('/room', roomRouter);

/**
 * Category Management Routes (/api/category)
 * @route /api/category
 * @desc Equipment category management endpoints
 * 
 * Available endpoints:
 * POST   /api/category/create - Create new category
 * PUT    /api/category/edit/:id - Update category
 * DELETE /api/category/delete/:id - Remove a category
 * GET    /api/category/all - List all categories
 * GET    /api/category/:id - Get specific category details
 */
router.use('/category', categoryRouter);

/**
 * Smart Board Management Routes (/api/smart-board)
 * @route /api/smart-board
 * @desc Smart board equipment management endpoints
 * 
 * Available endpoints:
 * POST   /api/smart-board/create - Create new smart board entry
 * PUT    /api/smart-board/edit/:id - Update smart board
 * DELETE /api/smart-board/delete/:id - Remove a smart board
 * GET    /api/smart-board/all - List all smart boards
 * GET    /api/smart-board/:id - Get specific smart board details
 */
router.use('/smart-board', smartBoardRouter);

/**
 * Dashboard Routes (/api/dashboard)
 * @route /api/dashboard
 * @desc Dashboard data and analytics endpoints
 * 
 * Available endpoints:
 * GET    /api/dashboard/summary - Get summary statistics
 * GET    /api/dashboard/recent - Get recent items
 */
router.use('/dashboard', dashboardRouter);

export default router;
