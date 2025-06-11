import path from 'path';
import winston from 'winston';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports with proper typing
const transports: winston.transport[] = [
  // Console transport for development
  new winston.transports.Console({
    format: logFormat,
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
  })
];

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger
const secureLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  levels: logLevels,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

/**
 * Sanitize sensitive data from objects before logging
 */
const sanitizeForLogging = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // Don't log potential sensitive strings
    if (obj.length > 100) {
      return obj.substring(0, 100) + '...[truncated]';
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForLogging);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'authorization',
      'cookie', 'session', 'auth', 'jwt', 'bearer', 'apikey',
      'creditcard', 'ssn', 'social', 'passport', 'license'
    ];
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Check if field is sensitive
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLogging(value);
      }
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Secure logger wrapper with automatic sanitization
 */
export const logger = {
  error: (message: string, meta?: any) => {
    secureLogger.error(message, meta ? sanitizeForLogging(meta) : undefined);
  },
  
  warn: (message: string, meta?: any) => {
    secureLogger.warn(message, meta ? sanitizeForLogging(meta) : undefined);
  },
  
  info: (message: string, meta?: any) => {
    secureLogger.info(message, meta ? sanitizeForLogging(meta) : undefined);
  },
  
  http: (message: string, meta?: any) => {
    secureLogger.http(message, meta ? sanitizeForLogging(meta) : undefined);
  },
  
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      secureLogger.debug(message, meta ? sanitizeForLogging(meta) : undefined);
    }
  },
  
  // Security-specific logging methods
  security: {
    authSuccess: (userId: string, ip: string, userAgent?: string) => {
      secureLogger.info('Authentication successful', {
        event: 'auth_success',
        userId,
        ip,
        userAgent: userAgent?.substring(0, 100) || 'unknown',
        timestamp: new Date().toISOString()
      });
    },
    
    authFailure: (reason: string, ip: string, userAgent?: string, email?: string) => {
      secureLogger.warn('Authentication failed', {
        event: 'auth_failure',
        reason,
        ip,
        userAgent: userAgent?.substring(0, 100) || 'unknown',
        email: email ? email.substring(0, 3) + '***' : undefined,
        timestamp: new Date().toISOString()
      });
    },
    
    suspiciousActivity: (activity: string, ip: string, details?: any) => {
      secureLogger.warn('Suspicious activity detected', {
        event: 'suspicious_activity',
        activity,
        ip,
        details: sanitizeForLogging(details),
        timestamp: new Date().toISOString()
      });
    },
    
    rateLimitExceeded: (ip: string, endpoint: string, userAgent?: string) => {
      secureLogger.warn('Rate limit exceeded', {
        event: 'rate_limit_exceeded',
        ip,
        endpoint,
        userAgent: userAgent?.substring(0, 100) || 'unknown',
        timestamp: new Date().toISOString()
      });
    },
    
    dataAccess: (userId: string, resource: string, action: string) => {
      secureLogger.info('Data access', {
        event: 'data_access',
        userId,
        resource,
        action,
        timestamp: new Date().toISOString()
      });
    }
  }
};

export default logger; 