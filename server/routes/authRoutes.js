const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAdmin } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // We will create this middleware next

// @route   POST /api/auth/register
// @desc    Register admin
// @access  Public (or restrict as needed, e.g., only one admin initially)
router.post('/register', registerAdmin);

// @route   POST /api/auth/login
// @desc    Login admin
// @access  Public
router.post('/login', loginAdmin);

// @route   GET /api/auth
// @desc    Get current logged in admin (useful for client to check auth status)
// @access  Private
router.get('/', authMiddleware, getAdmin);

module.exports = router; 