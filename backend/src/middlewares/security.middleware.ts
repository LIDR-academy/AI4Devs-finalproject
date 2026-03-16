import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';

/**
 * Rate limiting middleware following OWASP guidelines
 */
export const createRateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs, // 15 minutes default
    max, // limit each IP to max requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks and profile endpoint (temporary fix)
      return req.path === '/api/health' || req.path === '/api/profile';
    }
  });
};

/**
 * Stricter rate limiting for authentication endpoints
 */
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, 
  process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ? 1000 : 5
);

/**
 * General API rate limiter
 */
export const apiRateLimiter = createRateLimiter(
  15 * 60 * 1000, 
  process.env.NODE_ENV === 'development' ? 500 : 100 // Higher limit for development
); // 500 requests per 15 minutes in dev, 100 in production

/**
 * File upload rate limiter
 */
export const uploadRateLimiter = createRateLimiter(60 * 60 * 1000, 10); // 10 uploads per hour

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove potentially dangerous characters from string inputs
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    // Remove script tags and other dangerous HTML
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Security headers middleware (additional to Helmet)
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * Request logging middleware for security monitoring
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log suspicious patterns
  const userAgent = req.get('User-Agent') || '';
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /burp/i,
    /owasp/i,
    /<script/i,
    /javascript:/i,
    /union.*select/i,
    /drop.*table/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || 
    pattern.test(req.url) || 
    pattern.test(JSON.stringify(req.body || {}))
  );
  
  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      ip: req.ip,
      userAgent,
      url: req.url,
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }
  
  // Log response time for monitoring
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 5000) { // Log slow requests
      logger.warn('Slow request detected', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        duration,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
};

/**
 * CORS security middleware with stricter controls
 */
export const corsSecurityCheck = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    process.env.FRONTEND_URL,
    process.env.PUBLIC_URL
  ].filter(Boolean);
  
  // Check if origin is allowed
  if (origin && !allowedOrigins.includes(origin)) {
    logger.warn('Blocked request from unauthorized origin', {
      origin,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(403).json({
      error: 'Origin not allowed'
    });
  }
  
  next();
}; 