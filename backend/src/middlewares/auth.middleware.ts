import { NextFunction, Request, Response } from 'express';

// Extend the Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware to protect routes
 * For MVP this is a simple token verification, not using JWT
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    // If there's no authorization header, return 401
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For MVP, we're using a simplified token verification
    // In production, we would use JWT
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }
    
    const token = parts[1];
    
    // Check if the token starts with 'demo-token-'
    if (!token.startsWith('demo-token-')) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // In a real app, we would verify the token and get the user info
    // For MVP, we'll assume the user is authenticated
    req.user = {
      userId: '1',
      email: 'test@example.com',
    };
    
    next();
  } catch (error) {
    // Return appropriate error based on the type
    if (error instanceof Error) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
}; 