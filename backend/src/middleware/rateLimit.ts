import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Rate limiter para autenticación (login/registro)
export const authRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'), // máximo 10 intentos en desarrollo
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.',
      error: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Rate limiter general para todas las rutas
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Más permisivo en desarrollo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP. Intenta nuevamente en 15 minutos.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para health check y rutas de desarrollo
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Rate limiter específico para creación de propiedades
export const propertyCreationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 propiedades por hora por usuario
  message: {
    success: false,
    message: 'Demasiadas propiedades creadas. Intenta nuevamente en 1 hora.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usar la IP por defecto, ya que req.user puede no estar disponible
    return req.ip || 'unknown';
  }
});
