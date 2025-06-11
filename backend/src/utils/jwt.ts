import { User } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import logger from './logger';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate a JWT token for a user
 */
export const generateJwtToken = (user: User): string => {
  try {
    // Create payload with user ID and email
    const payload = {
      userId: user.id,
      email: user.email
    };

    // Sign token with options
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as StringValue };
    // Using Buffer.from to convert the secret to a Buffer
    const token = jwt.sign(payload, Buffer.from(JWT_SECRET, 'utf-8'), options);

    return token;
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, Buffer.from(JWT_SECRET, 'utf-8'));
  } catch (error) {
    logger.error('Error verifying JWT token:', error);
    throw new Error('Invalid or expired token');
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}; 