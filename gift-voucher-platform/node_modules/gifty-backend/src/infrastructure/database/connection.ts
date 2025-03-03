import mongoose from 'mongoose';
import { config } from 'dotenv';
import winston from 'winston';

// Load environment variables
config();

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

/**
 * Connect to MongoDB database
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      logger.warn('MONGO_URI environment variable is not defined, using in-memory database for development');
      // In development, we can continue without a real MongoDB connection
      if (process.env.NODE_ENV === 'development') {
        logger.info('Running in development mode without MongoDB connection');
        return;
      } else {
        throw new Error('MONGO_URI environment variable is not defined');
      }
    }
    
    await mongoose.connect(mongoUri);
    
    logger.info('Connected to MongoDB successfully');
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error });
    
    // In development, we can continue without a real MongoDB connection
    if (process.env.NODE_ENV === 'development') {
      logger.info('Running in development mode without MongoDB connection');
    } else {
      process.exit(1);
    }
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Failed to disconnect from MongoDB', { error });
  }
}; 