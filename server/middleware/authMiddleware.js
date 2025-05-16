const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Or User model if it's a general auth middleware

const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get admin from the token (or user)
      // Ensure the user/admin still exists and is valid
      req.admin = await Admin.findById(decoded.admin.id).select('-password'); 
      // If using for general users, it would be req.user = await User.findById(decoded.user.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({ msg: 'Not authorized, admin not found' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

module.exports = authMiddleware; 