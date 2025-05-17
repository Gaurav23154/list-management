const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please create a .env file in the server directory with these variables.');
  process.exit(1);
}

// Import routes
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const agentRoutes = require('./routes/agentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const contactRoutes = require('./routes/contactRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.VITE_API_URL?.replace('/api', '')] 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Blocked by CORS:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/ai', aiRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// MongoDB connection with retry logic
const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;

  const connect = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('Connected to MongoDB successfully');
      
      // Start server after successful database connection
      const PORT = process.env.PORT || 5001;
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`API URL: http://localhost:${PORT}/api`);
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      if (retries < maxRetries) {
        retries++;
        console.log(`Retrying connection (${retries}/${maxRetries})...`);
        setTimeout(connect, 5000 * retries);
      } else {
        console.error('Max retries reached. Please check your MongoDB connection.');
        process.exit(1);
      }
    }
  };

  await connect();
};

// Start the connection process
connectWithRetry();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit the process in production
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit the process in production
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
}); 