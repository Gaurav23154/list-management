const express = require('express');
const router = express.Router();
const {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent
} = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');

// All agent routes are protected and require admin authentication
router.use(authMiddleware);

// @route   POST /api/agents
// @desc    Create a new agent
// @access  Private (Admin only)
router.post('/', createAgent);

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private (Admin only)
router.get('/', getAllAgents);

// @route   GET /api/agents/:id
// @desc    Get a single agent by ID
// @access  Private (Admin only)
router.get('/:id', getAgentById);

// @route   PUT /api/agents/:id
// @desc    Update an agent
// @access  Private (Admin only)
router.put('/:id', updateAgent);

// @route   DELETE /api/agents/:id
// @desc    Delete an agent
// @access  Private (Admin only)
router.delete('/:id', deleteAgent);

module.exports = router; 