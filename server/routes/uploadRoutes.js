const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');
const { protect } = require('../middleware/authMiddleware');
const Upload = require('../models/Upload');
const Contact = require('../models/Contact');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Function to validate and format phone number
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (10-15 digits)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return null;
  }
  
  // Format as: +{country code}-{number}
  // If it's 10 digits, assume it's a US number
  if (cleaned.length === 10) {
    return `+1-${cleaned}`;
  }
  
  // Otherwise, format with country code
  return `+${cleaned}`;
};

// Function to validate CSV headers
const validateCSVHeaders = (filePath) => {
  return new Promise((resolve, reject) => {
    const requiredHeaders = ['name', 'email', 'phone'];
    const optionalHeaders = ['notes'];

    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const results = [];
    let headersValidated = false;

    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        if (!headersValidated) {
          const headers = Object.keys(record);
          const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
            return;
          }
          headersValidated = true;
        }

        // Validate required fields
        if (!record.name || !record.email || !record.phone) {
          reject(new Error('name, email, and phone are required fields'));
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(record.email)) {
          reject(new Error(`Invalid email format: ${record.email}`));
          return;
        }

        // Format and validate phone number
        const formattedPhone = formatPhoneNumber(record.phone);
        if (!formattedPhone) {
          reject(new Error('Invalid phone number format. Phone numbers should be 10-15 digits.'));
          return;
        }

        results.push({
          name: record.name.trim(),
          email: record.email.trim().toLowerCase(),
          phone: formattedPhone,
          notes: record.notes ? record.notes.trim() : ''
        });
      }
    });

    parser.on('error', function(err) {
      reject(new Error('Invalid CSV format'));
    });

    parser.on('end', function() {
      if (results.length === 0) {
        reject(new Error('CSV file is empty'));
        return;
      }
      resolve(results);
    });

    fs.createReadStream(filePath).pipe(parser);
  });
};

// Get all uploads
router.get('/', protect, async (req, res) => {
  try {
    const uploads = await Upload.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: uploads
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching uploads'
    });
  }
});

// Upload route
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select a file to upload' 
      });
    }

    // Create upload record
    const uploadRecord = await Upload.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      status: 'processing',
      uploadedBy: req.user._id
    });

    try {
      // Validate CSV
      const data = await validateCSVHeaders(req.file.path);

      // Process contacts
      const contacts = data.map(record => ({
        name: record.name,
        email: record.email,
        phone: record.phone,
        notes: record.notes,
        createdBy: req.user._id
      }));

      // Save contacts
      await Contact.insertMany(contacts);

      // Update upload status
      uploadRecord.status = 'completed';
      await uploadRecord.save();

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          contactsProcessed: contacts.length
        }
      });

    } catch (error) {
      // Update upload status to failed
      uploadRecord.status = 'failed';
      uploadRecord.error = error.message;
      await uploadRecord.save();

      // Delete the uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });

      res.status(400).json({
        success: false,
        message: error.message || 'Error processing file'
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file'
    });
  }
});

// Get upload by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    res.json({
      success: true,
      data: upload
    });
  } catch (error) {
    console.error('Get upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upload'
    });
  }
});

module.exports = router; 