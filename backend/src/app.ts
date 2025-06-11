import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import {
    apiRateLimiter,
    authRateLimiter,
    corsSecurityCheck,
    sanitizeInput,
    securityHeaders,
    securityLogger
} from './middlewares/security.middleware';
import routes from './routes';
import swaggerSpec from './swagger';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

export function setupServer() {
  // Set up Express app
  const app = express();
  
  // Security middleware - Applied first for maximum protection
  app.use(securityHeaders);
  app.use(securityLogger);
  
  // Helmet for security headers - Disabled problematic headers for HTTP
  app.use('/api/documents/:id/preview', (req, res, next) => {
    // Skip frame protection for PDF preview routes
    next();
  });
  
  app.use((req, res, next) => {
    // Skip helmet security headers for PDF preview routes
    if (req.path.includes('/api/documents/') && req.path.includes('/preview')) {
      return next();
    }
    
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginOpenerPolicy: false, // Disable for HTTP compatibility
      frameguard: { action: 'sameorigin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    })(req, res, next);
  });
  
  // CORS with security check
  app.use(corsSecurityCheck);
  app.use(cors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:3002',
      process.env.FRONTEND_URL,
      process.env.PUBLIC_URL
    ].filter((origin): origin is string => Boolean(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
  }));
  
  // Body parsing with size limits
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      // Store raw body for signature verification if needed
      (req as any).rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));
  
  // Input sanitization
  app.use(sanitizeInput);
  
  // Request logging - Only in development mode
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_HTTP_LOGS === 'true') {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        }
      }
    }));
  }
  
  // Serve static files from uploads directory with security
  const uploadsPath = path.join(__dirname, '..', 'uploads');
  app.use('/uploads', express.static(uploadsPath, {
    maxAge: '1d',
    etag: false,
    setHeaders: (res, path) => {
      // Prevent execution of uploaded files
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'attachment');
    }
  }));

  // Debug logging
  // console.log('Setting up routes...');
  // console.log('Routes object:', typeof routes);
  
  // Swagger Documentation with Basic Authentication
  const swaggerAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const auth = req.headers.authorization;
    
    if (!auth || !auth.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const credentials = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    // Use environment variables for Swagger credentials
    const swaggerUser = process.env.SWAGGER_USER || 'admin';
    const swaggerPass = process.env.SWAGGER_PASSWORD || 'admin123';
    
    if (username === swaggerUser && password === swaggerPass) {
      next();
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  };
  
  // Swagger Documentation with authentication and rate limiting
  // Disable CSP for Swagger UI routes to allow proper functionality
  app.use('/api-docs', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.removeHeader('Content-Security-Policy');
    next();
  }, apiRateLimiter, swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Serve Swagger specification as JSON (also protected)
  app.get('/api-docs.json', apiRateLimiter, swaggerAuth, (_req, res) => {
    res.json(swaggerSpec);
  });
  
  // Health check endpoint (no rate limiting for monitoring)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // PDF preview route - NO security headers for iframe compatibility
  app.get('/api/documents/:id/preview', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Remove security headers that block iframes
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    next();
  });
  
  // Apply rate limiting to API routes
  app.use('/api', apiRateLimiter);
  
  // Apply stricter rate limiting to auth routes
  app.use('/api/auth', authRateLimiter);
  
  // API Routes - Use the main router
  app.use('/api', routes);
  // console.log('Routes registered at /api');

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    logger.warn('404 - API endpoint not found', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  });

  // Global error handler with security considerations
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Log error details securely
    logger.error('Unhandled error', {
      error: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Don't expose sensitive error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Handle specific error types
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: 'Invalid JSON payload'
      });
    }
    
    if (err.type === 'entity.too.large') {
      return res.status(413).json({
        error: 'Payload too large'
      });
    }
    
    // Generic error response
    res.status(err.status || 500).json({
      error: isDevelopment 
        ? err.message || 'Something went wrong'
        : 'Internal server error',
      ...(isDevelopment && { stack: err.stack })
    });
  });
  
  return app;
}

/**
 * Creates an Express app for testing purposes
 * This function is used by integration tests
 */
export async function createApp() {
  // Simply return the configured Express app
  return setupServer();
}

// Create and export the app instance
const app = setupServer();
export default app; 