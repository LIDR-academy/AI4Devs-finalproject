import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/express';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };

    (req as AuthRequest).user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}; 