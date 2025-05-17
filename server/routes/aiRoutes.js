const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get AI-powered insights about contacts
// @route   GET /api/ai/insights
// @access  Private
router.get('/insights', protect, async (req, res) => {
  try {
    console.log('Fetching contacts for user:', req.user.id);
    
    // Validate user ID
    if (!req.user || !req.user.id) {
      console.error('Invalid user data:', req.user);
      return res.status(401).json({
        success: false,
        message: 'User authentication failed'
      });
    }

    const contacts = await Contact.find({ createdBy: req.user.id });
    console.log('Found contacts:', contacts.length);

    // Generate insights based on contact data
    const insights = [];
    const totalContacts = contacts.length;

    try {
      // Pattern Analysis
      const emailDomains = contacts.map(c => c.email?.split('@')[1]).filter(Boolean);
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
    } catch (error) {
      console.error('Error in pattern analysis:', error);
    }

    try {
      // Engagement Analysis
      const activeContacts = contacts.filter(c => c.status === 'active').length;
      const inactiveContacts = contacts.filter(c => c.status === 'inactive').length;
      const engagementRate = totalContacts > 0 ? (activeContacts / totalContacts) * 100 : 0;

      insights.push({
        type: 'trend',
        title: 'Contact Engagement',
        description: `Your contact engagement rate is ${engagementRate.toFixed(1)}%. ${activeContacts} active contacts vs ${inactiveContacts} inactive contacts.`,
        action: {
          text: 'Improve Engagement',
          url: '/dashboard'
        }
      });
    } catch (error) {
      console.error('Error in engagement analysis:', error);
    }

    try {
      // Geographic Analysis (based on phone numbers)
      const usNumbers = contacts.filter(c => c.phone?.startsWith('+1-')).length;
      const internationalNumbers = totalContacts - usNumbers;

      if (totalContacts > 0) {
        insights.push({
          type: 'pattern',
          title: 'Geographic Distribution',
          description: `${usNumbers} US contacts and ${internationalNumbers} international contacts in your database.`,
          action: {
            text: 'View Distribution',
            url: '/contacts'
          }
        });
      }
    } catch (error) {
      console.error('Error in geographic analysis:', error);
    }

    try {
      // Recommendations
      const activeContacts = contacts.filter(c => c.status === 'active').length;
      const inactiveContacts = contacts.filter(c => c.status === 'inactive').length;

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

      if (totalContacts > 100) {
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
    } catch (error) {
      console.error('Error in recommendations:', error);
    }

    // If no insights were generated, add a default insight
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Getting Started',
        description: 'Start adding contacts to see AI-powered insights about your data.',
        action: {
          text: 'Add Contacts',
          url: '/contacts/new'
        }
      });
    }

    console.log('Generated insights:', insights.length);
    const response = {
      success: true,
      data: insights
    };
    console.log('Sending response:', JSON.stringify(response, null, 2));
    
    res.json(response);
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating insights'
    });
  }
});

module.exports = router; 