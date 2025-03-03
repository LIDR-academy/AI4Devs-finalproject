import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../../domain/models/User';
import mongoose from 'mongoose';

// Extend the Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Authentication middleware to protect routes
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Log token for debugging
    console.log('Auth token:', token ? 'Present' : 'Not present');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as {
        id: string;
        role: string;
      };

      // Log decoded token for debugging
      console.log('Decoded token:', { id: decoded.id, role: decoded.role });

      // Get user from database
      const user = await User.findById(decoded.id).select('-password').lean();

      if (!user || !user._id) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Add user to request object
      req.user = {
        id: user._id.toString(),
        role: user.role as string
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 