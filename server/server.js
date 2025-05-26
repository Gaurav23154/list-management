const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const fs = require('fs');

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

app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});


app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  'http://13.51.150.158',
  'http://13.51.150.158:5001',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

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
  // Get the absolute path to the client build directory
  const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
  
  // Check if the build directory exists
  if (!fs.existsSync(clientBuildPath)) {
    console.error('Client build directory not found at:', clientBuildPath);
    console.error('Please ensure you have run "npm run build" in the client directory');
  }

  // Serve static files from the React app
  app.use(express.static(clientBuildPath));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        success: false,
        message: 'Client build files not found. Please ensure the client has been built.'
      });
    }
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
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`API URL: http://localhost:${PORT}/api`);
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using this port.`);
          process.exit(1);
        } else {
          console.error('Server error:', err);
          process.exit(1);
        }
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
          console.log('Server closed');
          mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
          });
        });
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