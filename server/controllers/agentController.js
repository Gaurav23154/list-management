const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');

// @desc    Create a new agent
// @route   POST /api/agents
// @access  Private (Admin only)
const createAgent = async (req, res) => {
  try {
    const { name, email, phone, status, notes } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and phone number'
      });
    }

    // Check if agent with email already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'An agent with this email already exists'
      });
    }

    const agentData = {
      name,
      email,
      phone,
      status: status || 'active',
      notes,
      createdBy: req.user._id
    };
    
    const agent = await Agent.create(agentData);
    
    res.status(201).json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Create agent error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Error creating agent'
    });
  }
};

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private (Admin only)
const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ createdBy: req.user._id });
    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agents'
    });
  }
};

// @desc    Get a single agent by ID
// @route   GET /api/agents/:id
// @access  Private (Admin only)
const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agent'
    });
  }
};

// @desc    Update an agent
// @route   PUT /api/agents/:id
// @access  Private (Admin only)
const updateAgent = async (req, res) => {
  try {
    const { name, email, phone, status, notes } = req.body;

    // Check if email is being updated and if it's already in use
    if (email) {
      const existingAgent = await Agent.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingAgent) {
        return res.status(400).json({
          success: false,
          message: 'An agent with this email already exists'
        });
      }
    }

    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name, email, phone, status, notes },
      { new: true, runValidators: true }
    );

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Update agent error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Error updating agent'
    });
  }
};

// @desc    Delete an agent
// @route   DELETE /api/agents/:id
// @access  Private (Admin only)
const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting agent'
    });
  }
};

module.exports = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent
}; 