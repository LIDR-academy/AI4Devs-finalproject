/**
 * Logger utility to suppress console output in test environments
 */
const logger = {
  error: (message: string, error?: unknown) => {
    // Don't log errors in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  },
  
  info: (message: string, data?: unknown) => {
    // Don't log info in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    
    if (data) {
      console.info(message, data);
    } else {
      console.info(message);
    }
  },
  
  warn: (message: string, data?: unknown) => {
    // Don't log warnings in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    
    if (data) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }
};

export default logger; 