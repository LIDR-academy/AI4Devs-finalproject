import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import app from './app';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  // Application should continue running despite unhandled promise rejections
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Keep the application running despite uncaught exceptions
});

// Start server with proper error handling
let server;
try {
  server = app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`Test the server: http://localhost:${port}/api/health`);

    // Log process info
    logger.info(`Process ID: ${process.pid}`);
    logger.info(`Node.js version: ${process.version}`);
  }).on('error', (err: NodeJS.ErrnoException) => {
    // Handle specific server errors
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use`);
      process.exit(1);
    } else {
      logger.error('Server error:', err);
    }
  });
} catch (err) {
  logger.error('Failed to start server:', err);
  process.exit(1);
}

// Keep the process alive with multiple redundant methods
setInterval(() => {
  logger.info(`Server still running on port ${port}... (${new Date().toISOString()})`);
}, 60000); // Log every minute to show it's still running

// Create a strong reference to prevent garbage collection
const keepAlive = server;

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing HTTP server and Prisma client...');
  if (server) {
    server.close(() => {
      logger.info('Server closed');
    });
  }
  await prisma.$disconnect();
  process.exit(0);
});

// Also handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  logger.info('SIGINT received. Closing HTTP server and Prisma client...');
  if (server) {
    server.close(() => {
      logger.info('Server closed');
    });
  }
  await prisma.$disconnect();
  process.exit(0);
}); 