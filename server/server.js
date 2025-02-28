// Load environment variables
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const { connectDB } = require("./config/database");
const path = require('path');
const multer = require('multer');

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} environment variable is required`);
    process.exit(1);
  }
}

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { 
    success: false, 
    message: 'Too many requests, please try again later.' 
  }
});
app.use(limiter);

// Pretty-print JSON responses in development
if (process.env.NODE_ENV === 'development') {
  app.set('json spaces', 2);
}

// Strict routing for consistent URLs
app.enable('strict routing');

// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    touchAfter: 24 * 3600 // Only update session once per day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Routes
app.use('/api', basicRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    message
  });
});

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('Received shutdown signal');
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    
    // Close database connection
    mongoose.connection.close(false, () => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });
}

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(port, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Promise Rejection:', err);
      gracefulShutdown();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();