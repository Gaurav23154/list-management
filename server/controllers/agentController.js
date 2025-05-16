const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');

// @desc    Create a new agent
// @route   POST /api/agents
// @access  Private (Admin only)
const createAgent = async (req, res) => {
  const { name, email, mobileNumber, password } = req.body;

  try {
    // Check if agent already exists
    let agent = await Agent.findOne({ email });
    if (agent) {
      return res.status(400).json({ msg: 'Agent already exists with this email' });
    }

    // Create new agent instance
    agent = new Agent({
      name,
      email,
      mobileNumber,
      password // Password will be hashed by the pre-save hook in Agent model
    });

    await agent.save();

    // Return new agent (excluding password)
    const agentData = agent.toObject();
    delete agentData.password;

    res.status(201).json(agentData);

  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
    }
    res.status(500).send('Server error during agent creation');
  }
};

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private (Admin only)
const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select('-password'); // Exclude passwords
    res.json(agents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error while fetching agents');
  }
};

// @desc    Get a single agent by ID
// @route   GET /api/agents/:id
// @access  Private (Admin only)
const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    if (!agent) {
      return res.status(404).json({ msg: 'Agent not found' });
    }
    res.json(agent);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Agent not found (invalid ID format)' });
    }
    res.status(500).send('Server error while fetching agent');
  }
};

// @desc    Update an agent
// @route   PUT /api/agents/:id
// @access  Private (Admin only)
const updateAgent = async (req, res) => {
  const { name, email, mobileNumber, password } = req.body;
  const agentId = req.params.id;

  try {
    let agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ msg: 'Agent not found' });
    }

    // Check if email is being updated and if it conflicts with an existing agent
    if (email && email !== agent.email) {
      const existingAgentWithEmail = await Agent.findOne({ email });
      if (existingAgentWithEmail && existingAgentWithEmail._id.toString() !== agentId) {
        return res.status(400).json({ msg: 'Email already in use by another agent' });
      }
      agent.email = email;
    }

    if (name) agent.name = name;
    if (mobileNumber) agent.mobileNumber = mobileNumber;
    
    // Handle password update
    if (password) {
      // If password is provided, it means we want to update it.
      // The pre-save hook will hash it automatically if it's modified.
      agent.password = password;
    }

    await agent.save();

    const updatedAgentData = agent.toObject();
    delete updatedAgentData.password; // Ensure password is not returned even if re-hashed

    res.json(updatedAgentData);

  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
    }
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Agent not found (invalid ID format)' });
    }
    res.status(500).send('Server error during agent update');
  }
};

// @desc    Delete an agent
// @route   DELETE /api/agents/:id
// @access  Private (Admin only)
const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ msg: 'Agent not found' });
    }

    await agent.deleteOne(); // Changed from agent.remove() which is deprecated
    // Consider what to do with lists assigned to this agent. For now, just deleting the agent.

    res.json({ msg: 'Agent removed successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Agent not found (invalid ID format)' });
    }
    res.status(500).send('Server error during agent deletion');
  }
};

module.exports = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent
}; 