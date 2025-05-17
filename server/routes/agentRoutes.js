const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent
} = require('../controllers/agentController');

// CRUD routes with protection
router.post('/', protect, createAgent);
router.get('/', protect, getAllAgents);
router.get('/:id', protect, getAgentById);
router.put('/:id', protect, updateAgent);
router.delete('/:id', protect, deleteAgent);

module.exports = router; 