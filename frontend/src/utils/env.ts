/**
 * Environment variable utilities
 * Provides type-safe access to environment variables
 */

export const env = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  apiVersion: import.meta.env.VITE_API_VERSION,

  // Environment
  nodeEnv: import.meta.env.VITE_NODE_ENV,

  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME,
  appVersion: import.meta.env.VITE_APP_VERSION,

  // Feature Flags
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
} as const;

/**
 * Get the full API URL with version
 */
export const getApiUrl = (endpoint: string = ''): string => {
  const base = env.apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  const version = env.apiVersion;
  const path = endpoint.replace(/^\//, ''); // Remove leading slash

  return `${base}/api/${version}/${path}`;
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return env.nodeEnv === 'development';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return env.nodeEnv === 'production';
};
