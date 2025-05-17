const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Contact = require('../models/Contact');
const Agent = require('../models/Agent');

// Get dashboard statistics
router.get('/stats', protect, async (req, res) => {
  try {
    // Get total contacts
    const totalContacts = await Contact.countDocuments({ createdBy: req.user._id });

    // Get total agents
    const totalAgents = await Agent.countDocuments({ createdBy: req.user._id });

    // Get contacts by status
    const contactsByStatus = await Contact.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Convert to object format
    const contactsByStatusObject = contactsByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr.count;
      return acc;
    }, {});

    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUploads = await Contact.aggregate([
      { 
        $match: { 
          createdBy: req.user._id,
          createdAt: { $gte: sevenDaysAgo } 
        } 
      },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    // Get basic insights
    const basicInsights = [];

    // Add status distribution insight
    if (contactsByStatus.length > 0) {
      const activePercentage = Math.round(
        (contactsByStatusObject.active || 0) / totalContacts * 100
      );
      basicInsights.push({
        title: 'Contact Status Distribution',
        description: `${activePercentage}% of contacts are active`,
        type: 'status',
        date: new Date()
      });
    }

    // Add recent activity insight
    if (recentUploads.length > 0) {
      const totalRecent = recentUploads.reduce((sum, day) => sum + day.count, 0);
      basicInsights.push({
        title: 'Recent Activity',
        description: `${totalRecent} contacts added in the last 7 days`,
        type: 'activity',
        date: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        totalContacts,
        totalAgents,
        contactsByStatus: contactsByStatusObject,
        recentUploads,
        insights: basicInsights
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

module.exports = router; 