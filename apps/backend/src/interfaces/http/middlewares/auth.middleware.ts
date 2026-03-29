
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token error' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatted' });
  }

  try {
    const decoded: any = jwt.verify(token, env.JWT_SECRET);
    
    // Attach user info to request
    // @ts-ignore
    req.user = {
      id: decoded.sub,
      userId: decoded.role === 'GUEST' ? null : (decoded.userId || decoded.sub), // Guests don't have a real userId
      email: decoded.email,
      role: decoded.role || 'CLIENT',
      projectId: decoded.projectId, // Only for GUEST
      permissions: decoded.permissions, // Only for GUEST
      guestName: decoded.guestName, // Only for GUEST
    };
    
    return next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
