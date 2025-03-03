/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics and statistics endpoints
 */

import express from 'express';
import { runQuery } from './db.js';
const router = express.Router();

/**
 * Get summary statistics for all inventory items
 * @route GET /api/dashboard/summary
 * @returns {object} 200 - Dashboard statistics object containing:
 *   - computers: Statistics about computer inventory
 *     - total: Total number of computers
 *     - uniqueCategories: Number of unique computer categories
 *     - functionalCount: Number of functional computers
 *     - maintenanceCount: Number of computers in maintenance
 *     - retiredCount: Number of retired computers
 *     - oldestInstallation: Date of oldest computer installation
 *     - newestInstallation: Date of newest computer installation
 *   - rooms: Statistics about rooms
 *     - total: Total number of rooms
 *     - uniqueTypes: Number of unique room types
 *     - types: List of all room types
 *     - functionalCount: Number of active rooms
 *     - maintenanceCount: Number of rooms in maintenance
 *     - inactiveCount: Number of inactive rooms
 *   - smartBoards: Statistics about smart boards
 *     - total: Total number of smart boards
 *     - uniqueModels: Number of unique smart board models
 *     - functionalCount: Number of functional smart boards
 *     - maintenanceCount: Number of smart boards in maintenance
 *     - retiredCount: Number of retired smart boards
 *   - labUtilities: Statistics about lab utilities
 *     - total: Total number of lab utilities
 *     - functionalCount: Number of functional utilities
 *     - maintenanceCount: Number of utilities in maintenance
 *     - retiredCount: Number of retired utilities
 *     - averageQuantity: Average quantity per utility item
 *   - computerCategories: Statistics about computer categories
 *     - total: Total number of categories
 *     - uniqueReleaseYears: Number of unique release years
 *     - oldestModel: Date of oldest model
 *     - newestModel: Date of newest model
 *   - timeline: Installation timeline data
 *   - roomUtilization: Room utilization statistics
 * @throws {object} 500 - Server error
 */
router.get('/summary', async (req, res) => {
    try {
        const stats = {
            computers: {},
            rooms: {},
            smartBoards: {},
            labUtilities: {},
            computerCategories: {},
            timeline: {},
            roomUtilization: {}
        };

        // Get computer statistics with age distribution
        const computerStats = await runQuery(`
            SELECT 
                COUNT(*) as total_rows,
                SUM(quantity) as total,
                COUNT(DISTINCT belongstocategory) as uniqueCategories,
                SUM(CASE WHEN status = 'functional' THEN quantity ELSE 0 END) as functionalCount,
                SUM(CASE WHEN status = 'maintenance' THEN quantity ELSE 0 END) as maintenanceCount,
                SUM(CASE WHEN status = 'retired' THEN quantity ELSE 0 END) as retiredCount,
                MIN(install_date) as oldestInstallation,
                MAX(install_date) as newestInstallation
            FROM computer
        `);
        stats.computers = computerStats[0];

        // Get room statistics with type distribution
        const roomStats = await runQuery(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as functionalCount,
                COUNT(DISTINCT type) as uniqueTypes,
                GROUP_CONCAT(DISTINCT type) as types,
                COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenanceCount,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactiveCount
            FROM room
        `);
        stats.rooms = roomStats[0];

        // Get smart board statistics with installation timeline
        const smartBoardStats = await runQuery(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT model_id) as uniqueModels,
                COUNT(CASE WHEN status = 'functional' THEN 1 END) as functionalCount,
                COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenanceCount,
                COUNT(CASE WHEN status = 'retired' THEN 1 END) as retiredCount,
                MIN(installed_date) as oldestInstallation,
                MAX(installed_date) as newestInstallation
            FROM smart_board
        `);
        stats.smartBoards = smartBoardStats[0];

        // Get lab utilities statistics with status distribution
        const labUtilityStats = await runQuery(`
            SELECT 
                COUNT(*) as total_rows,
                SUM(quantity) as total,
                SUM(CASE WHEN status = 'functional' THEN quantity ELSE 0 END) as functionalCount,
                SUM(CASE WHEN status = 'maintenance' THEN quantity ELSE 0 END) as maintenanceCount,
                SUM(CASE WHEN status = 'retired' THEN quantity ELSE 0 END) as retiredCount,
                AVG(quantity) as averageQuantity
            FROM lab_utility
        `);
        stats.labUtilities = labUtilityStats[0];

        // Get computer categories statistics with timeline
        const computerCatStats = await runQuery(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT model_release_date) as uniqueReleaseYears,
                MIN(model_release_date) as oldestModel,
                MAX(model_release_date) as newestModel
            FROM computer_cat
        `);
        stats.computerCategories = computerCatStats[0];

        // Get installation timeline data
        const timelineData = await runQuery(`
            SELECT 
                DATE_FORMAT(install_date, '%Y-%m') as month,
                SUM(quantity) as installations
            FROM computer
            WHERE install_date IS NOT NULL
            GROUP BY DATE_FORMAT(install_date, '%Y-%m')
            ORDER BY month DESC
            LIMIT 12
        `);
        stats.timeline.computers = timelineData;

        // Get room utilization data
        const roomUtilization = await runQuery(`
            SELECT 
                r.id,
                r.label as room_name,
                r.type as room_type,
                (
                    SELECT SUM(quantity)
                    FROM computer c2
                    WHERE c2.isassignedto = r.id
                ) as computer_count,
                (
                    SELECT COUNT(DISTINCT s2.id)
                    FROM smart_board s2
                    WHERE s2.isassignedto = r.id
                ) as smartboard_count,
                (
                    SELECT SUM(quantity)
                    FROM lab_utility l2
                    WHERE l2.isassignedto = r.id
                ) as utility_count,
                (
                    SELECT SUM(quantity)
                    FROM computer c3
                    WHERE c3.isassignedto = r.id AND c3.status = 'functional'
                ) as functional_computers,
                (
                    SELECT COUNT(DISTINCT s3.id)
                    FROM smart_board s3
                    WHERE s3.isassignedto = r.id AND s3.status = 'functional'
                ) as functional_smartboards,
                (
                    SELECT SUM(quantity)
                    FROM lab_utility l3
                    WHERE l3.isassignedto = r.id AND l3.status = 'functional'
                ) as functional_utilities,
                ROUND(
                    (
                        COALESCE((
                            SELECT SUM(quantity)
                            FROM computer c5
                            WHERE c5.isassignedto = r.id AND c5.status = 'functional'
                        ), 0) * 100.0 / 
                        NULLIF(COALESCE((
                            SELECT SUM(quantity)
                            FROM computer c6
                            WHERE c6.isassignedto = r.id
                        ), 0), 0)
                    ), 1
                ) as computer_functional_percentage,
                ROUND(
                    (
                        COALESCE((
                            SELECT COUNT(DISTINCT s5.id)
                            FROM smart_board s5
                            WHERE s5.isassignedto = r.id AND s5.status = 'functional'
                        ), 0) * 100.0 / 
                        NULLIF(COALESCE((
                            SELECT COUNT(DISTINCT s6.id)
                            FROM smart_board s6
                            WHERE s6.isassignedto = r.id
                        ), 0), 0)
                    ), 1
                ) as smartboard_functional_percentage,
                ROUND(
                    (
                        COALESCE((
                            SELECT SUM(quantity)
                            FROM lab_utility l5
                            WHERE l5.isassignedto = r.id AND l5.status = 'functional'
                        ), 0) * 100.0 / 
                        NULLIF(COALESCE((
                            SELECT SUM(quantity)
                            FROM lab_utility l6
                            WHERE l6.isassignedto = r.id
                        ), 0), 0)
                    ), 1
                ) as utility_functional_percentage
            FROM room r
            ORDER BY (
                COALESCE((
                    SELECT SUM(quantity)
                    FROM computer c4
                    WHERE c4.isassignedto = r.id
                ), 0) + 
                COALESCE((
                    SELECT COUNT(DISTINCT s4.id)
                    FROM smart_board s4
                    WHERE s4.isassignedto = r.id
                ), 0) + 
                COALESCE((
                    SELECT SUM(quantity)
                    FROM lab_utility l4
                    WHERE l4.isassignedto = r.id
                ), 0)
            ) DESC
        `);
        stats.roomUtilization = roomUtilization;

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get recent items from all inventory tables
 * @route GET /api/dashboard/recent
 * @returns {object} 200 - Recent items object containing:
 *   - computers: Last 5 computers added (with room and category details)
 *   - rooms: Last 5 rooms added
 *   - smartBoards: Last 5 smart boards added (with room details)
 *   - labUtilities: Last 5 lab utilities added (with room details)
 * @throws {object} 500 - Server error
 */
router.get('/recent', async (req, res) => {
    try {
        const recent = {};

        // Get recent computers
        const recentComputers = await runQuery(`
            SELECT c.*, r.label as room_name, cc.label as category_name 
            FROM computer c 
            LEFT JOIN room r ON c.isassignedto = r.id
            LEFT JOIN computer_cat cc ON c.belongstocategory = cc.id
            ORDER BY c.id DESC LIMIT 5
        `);
        recent.computers = recentComputers;

        // Get recent rooms
        const recentRooms = await runQuery(`
            SELECT * FROM room ORDER BY id DESC LIMIT 5
        `);
        recent.rooms = recentRooms;

        // Get recent smart boards
        const recentSmartBoards = await runQuery(`
            SELECT sb.*, r.label as room_name 
            FROM smart_board sb
            LEFT JOIN room r ON sb.isassignedto = r.id
            ORDER BY sb.id DESC LIMIT 5
        `);
        recent.smartBoards = recentSmartBoards;

        // Get recent lab utilities
        const recentUtilities = await runQuery(`
            SELECT lu.*, r.label as room_name 
            FROM lab_utility lu
            LEFT JOIN room r ON lu.isassignedto = r.id
            ORDER BY lu.id DESC LIMIT 5
        `);
        recent.labUtilities = recentUtilities;

        res.json(recent);
    } catch (error) {
        console.error('Error fetching recent items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;