const List = require('../models/List');
const Agent = require('../models/Agent');
const multer = require('multer');
const Papa = require('papaparse');
const fs = require('fs');

// Multer setup for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' || // for .xls
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // for .xlsx
       ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'), false);
    }
  }
}).single('listFile'); // 'listFile' is the name of the field in the form-data

// @desc    Upload CSV, parse, validate, distribute, and save lists
// @route   POST /api/lists/upload
// @access  Private (Admin only)
const uploadAndDistributeList = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      // Multer error (e.g., file type validation)
      return res.status(400).json({ msg: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    try {
      const fileContent = req.file.buffer.toString('utf8');
      let parsedData;

      // PapaParse for CSV parsing
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          parsedData = results.data;
        },
        error: (error) => {
          console.error('CSV Parsing Error:', error.message);
          return res.status(400).json({ msg: 'Error parsing CSV file.', details: error.message });
        }
      });

      if (!parsedData || parsedData.length === 0) {
        return res.status(400).json({ msg: 'CSV file is empty or invalid.' });
      }

      // Validate CSV format (headers: FirstName, Phone, Notes)
      const requiredHeaders = ['FirstName', 'Phone', 'Notes'];
      const actualHeaders = Object.keys(parsedData[0]);
      const missingHeaders = requiredHeaders.filter(header => !actualHeaders.includes(header));
      
      if (missingHeaders.length > 0 && !(actualHeaders.includes('FirstName') && actualHeaders.includes('Phone'))) {
           // Allow if only Notes is missing, but FirstName and Phone must exist
        return res.status(400).json({ 
            msg: 'Invalid CSV format. Required headers are FirstName, Phone. Notes is optional.',
            missing: missingHeaders 
        });
      }
      
      // Filter out rows that don't have at least FirstName and Phone
      const validTasks = parsedData.filter(row => row.FirstName && row.Phone).map(row => ({
        firstName: row.FirstName,
        phone: row.Phone,
        notes: row.Notes || '' // Default to empty string if notes are missing
      }));

      if (validTasks.length === 0) {
        return res.status(400).json({ msg: 'No valid tasks found in the CSV. Ensure FirstName and Phone are present for each task.' });
      }

      const agents = await Agent.find().select('_id');
      if (!agents || agents.length === 0) {
        return res.status(400).json({ msg: 'No agents available to distribute tasks.' });
      }
      
      // For simplicity with requirement of 5 agents, we hardcode this. 
      // In a real app, this might be configurable or based on available agents.
      const numberOfAgentsToDistribute = 5;
      if (agents.length < numberOfAgentsToDistribute) {
          console.warn(`Warning: Less than ${numberOfAgentsToDistribute} agents available. Tasks will be distributed among available agents.`);
      }
      const activeAgents = agents.slice(0, Math.min(agents.length, numberOfAgentsToDistribute));

      // Distribute tasks
      const tasksPerAgent = Math.floor(validTasks.length / activeAgents.length);
      let remainderTasks = validTasks.length % activeAgents.length;
      const distributedLists = [];
      let taskIndex = 0;

      for (let i = 0; i < activeAgents.length; i++) {
        const agentId = activeAgents[i]._id;
        const agentTasksCount = tasksPerAgent + (remainderTasks > 0 ? 1 : 0);
        if (remainderTasks > 0) remainderTasks--;

        const agentTasks = validTasks.slice(taskIndex, taskIndex + agentTasksCount);
        taskIndex += agentTasksCount;

        if (agentTasks.length > 0) {
          const newList = new List({
            agent: agentId,
            tasks: agentTasks,
            originalFileName: req.file.originalname
          });
          distributedLists.push(newList.save()); // Collect promises
        }
      }

      await Promise.all(distributedLists);
      res.status(201).json({ 
          msg: 'File uploaded and tasks distributed successfully.', 
          distributedTasksCount: validTasks.length,
          agentsAssigned: activeAgents.length
      });

    } catch (err) {
      console.error('Error in uploadAndDistributeList:', err.message);
      res.status(500).send('Server error during list processing.');
    }
  });
};

// @desc    Get all distributed lists (grouped by agent or all lists)
// @route   GET /api/lists
// @access  Private (Admin or specific agent)
const getAllLists = async (req, res) => {
  try {
    // Populate agent details along with the lists
    const lists = await List.find().populate('agent', 'name email'); 
    res.json(lists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error while fetching lists.');
  }
};

// @desc    Get lists for a specific agent
// @route   GET /api/lists/agent/:agentId
// @access  Private (Admin or the specific agent)
const getListsByAgent = async (req, res) => {
    try {
        const agentId = req.params.agentId;
        const lists = await List.find({ agent: agentId }).populate('agent', 'name email');
        if (!lists || lists.length === 0) {
            return res.status(404).json({ msg: 'No lists found for this agent.' });
        }
        res.json(lists);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid agent ID format.' });
        }
        res.status(500).send('Server error while fetching agent lists.');
    }
};

module.exports = {
  uploadAndDistributeList,
  getAllLists,
  getListsByAgent
}; 