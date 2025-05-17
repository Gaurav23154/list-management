const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const contacts = await Contact.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contacts'
    });
  }
});

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contact'
    });
  }
});

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating contact'
    });
  }
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting contact'
    });
  }
});

// @desc    Get AI-powered insights about contacts
// @route   GET /api/contacts/ai-insights
// @access  Private
router.get('/ai-insights', protect, async (req, res) => {
  try {
    const contacts = await Contact.find({ createdBy: req.user.id });

    // Generate insights based on contact data
    const insights = [];

    // Pattern Analysis
    const emailDomains = contacts.map(c => c.email.split('@')[1]);
    const domainCounts = emailDomains.reduce((acc, domain) => {
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});

    const topDomains = Object.entries(domainCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (topDomains.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Top Email Domains',
        description: `Most of your contacts use these email domains: ${topDomains.map(([domain, count]) => `${domain} (${count})`).join(', ')}`,
        action: {
          text: 'View Contacts',
          url: '/contacts'
        }
      });
    }

    // Engagement Analysis
    const activeContacts = contacts.filter(c => c.status === 'active').length;
    const inactiveContacts = contacts.filter(c => c.status === 'inactive').length;
    const engagementRate = (activeContacts / contacts.length) * 100;

    insights.push({
      type: 'trend',
      title: 'Contact Engagement',
      description: `Your contact engagement rate is ${engagementRate.toFixed(1)}%. ${activeContacts} active contacts vs ${inactiveContacts} inactive contacts.`,
      action: {
        text: 'Improve Engagement',
        url: '/dashboard'
      }
    });

    // Geographic Analysis (based on phone numbers)
    const usNumbers = contacts.filter(c => c.phone.startsWith('+1-')).length;
    const internationalNumbers = contacts.length - usNumbers;

    insights.push({
      type: 'pattern',
      title: 'Geographic Distribution',
      description: `${usNumbers} US contacts and ${internationalNumbers} international contacts in your database.`,
      action: {
        text: 'View Distribution',
        url: '/contacts'
      }
    });

    // Recommendations
    if (inactiveContacts > activeContacts) {
      insights.push({
        type: 'recommendation',
        title: 'Engagement Opportunity',
        description: 'You have more inactive contacts than active ones. Consider reaching out to re-engage these contacts.',
        action: {
          text: 'View Inactive Contacts',
          url: '/contacts?status=inactive'
        }
      });
    }

    if (contacts.length > 100) {
      insights.push({
        type: 'recommendation',
        title: 'Scale Opportunity',
        description: 'You have a large contact database! Consider segmenting your contacts for targeted outreach.',
        action: {
          text: 'Learn More',
          url: '/dashboard'
        }
      });
    }

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating insights'
    });
  }
});

module.exports = router; 