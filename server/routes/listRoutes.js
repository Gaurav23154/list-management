const express = require('express');
const router = express.Router();
const {
  uploadAndDistributeList,
  getAllLists,
  getListsByAgent
} = require('../controllers/listController');
const authMiddleware = require('../middleware/authMiddleware');

// All list routes are protected
router.use(authMiddleware);

// @route   POST /api/lists/upload
// @desc    Upload CSV, parse, validate, distribute, and save lists
// @access  Private (Admin only)
router.post('/upload', uploadAndDistributeList); // Multer is handled within the controller

// @route   GET /api/lists
// @desc    Get all distributed lists
// @access  Private (Admin only - or could be adapted for agents to see their own)
router.get('/', getAllLists);

// @route   GET /api/lists/agent/:agentId
// @desc    Get lists for a specific agent
// @access  Private (Admin or the specific agent if IDs match - needs refinement in controller if so)
router.get('/agent/:agentId', getListsByAgent);

module.exports = router; 