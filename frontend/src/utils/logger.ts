// Production-ready logging system
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private sessionId = this.generateSessionId();
  private userId?: string;
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  setContext(context: string) {
    this.context = context;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = `[${entry.level.toUpperCase()}]`;
    const context = entry.context ? `[${entry.context}]` : '';
    const timestamp = this.isDevelopment ? `[${new Date(entry.timestamp).toLocaleTimeString()}]` : '';
    
    return `${timestamp}${prefix}${context} ${entry.message}`;
  }

  private logToConsole(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return;

    const message = this.formatMessage(entry);
    
    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.data);
        break;
      case 'info':
        console.info(message, entry.data);
        break;
      case 'warn':
        console.warn(message, entry.data);
        break;
      case 'error':
        console.error(message, entry.data);
        break;
    }
  }

  private async sendToServer(entry: LogEntry) {
    // Only send errors and warnings to server in production
    if (!this.shouldLog(entry.level)) return;

    try {
      // In a real app, you would send logs to your logging service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
      
      // For now, just store in localStorage for debugging
      if (this.isDevelopment) {
        const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
        logs.push(entry);
        // Keep only last 100 logs
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100);
        }
        localStorage.setItem('app_logs', JSON.stringify(logs));
      }
    } catch (error) {
      // Fallback to console if server logging fails
      console.error('Failed to send log to server:', error);
    }
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry = this.createLogEntry(level, message, data);
    
    this.logToConsole(entry);
    this.sendToServer(entry);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any) {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;

    this.log('error', message, errorData);
  }

  // Performance logging
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // API call logging
  apiCall(method: string, url: string, status?: number, duration?: number) {
    const message = `API ${method} ${url}`;
    const data = { method, url, status, duration };
    
    if (status && status >= 400) {
      this.error(message, data);
    } else {
      this.info(message, data);
    }
  }

  // User action logging
  userAction(action: string, data?: any) {
    this.info(`User action: ${action}`, data);
  }

  // Performance metrics
  performance(metric: string, value: number, unit: string = 'ms') {
    this.info(`Performance: ${metric}`, { value, unit });
  }

  // Get logs for debugging
  getLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  // Clear logs
  clearLogs() {
    localStorage.removeItem('app_logs');
  }

  // Export logs for support
  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }
}

// Create logger instances for different parts of the app
export const logger = new Logger();
export const apiLogger = new Logger('API');
export const uiLogger = new Logger('UI');
export const authLogger = new Logger('AUTH');
export const performanceLogger = new Logger('PERFORMANCE');

// Utility functions to replace console.log usage
export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, error?: Error | any) => logger.error(message, error),
  
  // Specialized loggers
  api: {
    request: (method: string, url: string, data?: any) => 
      apiLogger.info(`${method} ${url}`, data),
    response: (method: string, url: string, status: number, duration?: number) => 
      apiLogger.apiCall(method, url, status, duration),
    error: (method: string, url: string, error: any) => 
      apiLogger.error(`${method} ${url} failed`, error),
  },
  
  ui: {
    render: (component: string, props?: any) => 
      uiLogger.debug(`Rendering ${component}`, props),
    interaction: (action: string, element?: string, data?: any) => 
      uiLogger.userAction(`${action} ${element || ''}`, data),
    error: (component: string, error: any) => 
      uiLogger.error(`${component} error`, error),
  },
  
  auth: {
    login: (userId: string) => {
      authLogger.setUserId(userId);
      authLogger.info('User logged in', { userId });
    },
    logout: () => authLogger.info('User logged out'),
    error: (action: string, error: any) => 
      authLogger.error(`Auth ${action} failed`, error),
  },
  
  performance: {
    measure: (metric: string, value: number, unit?: string) => 
      performanceLogger.performance(metric, value, unit),
    time: (label: string) => performanceLogger.time(label),
    timeEnd: (label: string) => performanceLogger.timeEnd(label),
  },
};

// Development-only console replacement
export const devLog = process.env.NODE_ENV === 'development' ? console : {
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  time: () => {},
  timeEnd: () => {},
  group: () => {},
  groupEnd: () => {},
  table: () => {},
};

// Error boundary integration
export const logError = (error: Error, errorInfo?: any) => {
  logger.error('React Error Boundary caught error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    errorInfo,
  });
};

export default logger; 