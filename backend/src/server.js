// src/server.js - Organized Express server
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

// Import configuration
const config = require('./config/environment');
const { testConnection } = require('./config/database');

// Import middleware
const { generalLimiter, authLimiter } = require('./middleware/rateLimiting');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { cleanupExpiredTokens } = require('./middleware/auth');
const logger = require('./utils/logger');

// Import routes
const apiRoutes = require('./routes/index');

// Create Express app
const app = express();

// Security middleware
if (config.isProduction) {
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
}

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://car-scout-india.vercel.app',
      config.CORS_ORIGIN
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
};

if (config.ENABLE_CORS) {
  app.use(cors(corsOptions));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
if (config.ENABLE_REQUEST_LOGGING) {
  app.use(logger.requestLogger.bind(logger));
}

// Rate limiting
if (config.ENABLE_RATE_LIMITING && config.isProduction) {
  app.use('/api/auth', authLimiter);
  app.use('/api', generalLimiter);
}

// API routes
app.use('/api', apiRoutes);

// Health check at root
app.get('/', (req, res) => {
  res.json({
    message: 'AutoPulse Car Scout API - Organized Structure',
    version: '2.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    structure: 'organized'
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    
    // Close database connections, clear timers, etc.
    console.log('Cleanup completed. Exiting...');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Start server
const startServer = async () => {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start HTTP server
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server started successfully!`, {
        port: config.PORT,
        environment: config.NODE_ENV,
        cors: config.ENABLE_CORS,
        rateLimiting: config.ENABLE_RATE_LIMITING && config.isProduction,
        timestamp: new Date().toISOString()
      });

      logger.info(`📍 Server URLs:`, {
        local: `http://localhost:${config.PORT}`,
        health: `http://localhost:${config.PORT}/api/health`,
        api: `http://localhost:${config.PORT}/api`
      });
    });

    // Setup cleanup for expired tokens (every hour)
    setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

    // Graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection:', err);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    return server;

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };