import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT Authentication middleware following OWASP security guidelines
 */
export const jwtAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'MISSING_TOKEN'
      });
    }

    // Validate Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Invalid authorization format. Use: Bearer <token>',
        code: 'INVALID_FORMAT'
      });
    }
    
    const token = parts[1];
    
    // Validate token is not empty
    if (!token || token.trim() === '') {
      return res.status(401).json({ 
        error: 'Token cannot be empty',
        code: 'EMPTY_TOKEN'
      });
    }

    // Get JWT secret from environment
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({ 
        error: 'Authentication service unavailable',
        code: 'CONFIG_ERROR'
      });
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'], // Only allow HS256 algorithm
      maxAge: '24h', // Maximum token age
      clockTolerance: 30 // 30 seconds clock tolerance
    }) as JWTPayload;

    // Validate required payload fields
    if (!decoded.userId || !decoded.email) {
      return res.status(401).json({ 
        error: 'Invalid token payload',
        code: 'INVALID_PAYLOAD'
      });
    }

    // Check token expiration (additional check)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Add user info to request (matching existing interface)
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    // Log successful authentication (without sensitive data)
    logger.info('User authenticated', {
      userId: decoded.userId,
      email: decoded.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    next();
  } catch (error) {
    // Handle different JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      } else if (error.name === 'NotBeforeError') {
        return res.status(401).json({ 
          error: 'Token not active yet',
          code: 'TOKEN_NOT_ACTIVE'
        });
      }
    }

    // Log authentication failure
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      token: req.headers.authorization ? 'present' : 'missing'
    });

    return res.status(401).json({ 
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Generate JWT token with secure settings
 */
export const generateJWT = (payload: { userId: string; email: string }): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      iat: Math.floor(Date.now() / 1000) // Issued at
    },
    jwtSecret,
    {
      algorithm: 'HS256',
      expiresIn: '24h', // Token expires in 24 hours
      issuer: 'shopmefy-api',
      audience: 'shopmefy-client'
    }
  );
};

/**
 * Refresh token middleware (for token refresh endpoint)
 */
export const refreshTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ 
        error: 'Authentication service unavailable',
        code: 'CONFIG_ERROR'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtSecret, {
      algorithms: ['HS256']
    }) as JWTPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    logger.warn('Refresh token validation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip
    });

    return res.status(401).json({ 
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: { userId: string; email: string }): string => {
  const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }

  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'refresh'
    },
    jwtSecret,
    {
      algorithm: 'HS256',
      expiresIn: '7d', // Refresh token expires in 7 days
      issuer: 'shopmefy-api',
      audience: 'shopmefy-client'
    }
  );
}; 