/// <reference types="vite/client" />

/**
 * Type definitions for environment variables
 * All environment variables must be prefixed with VITE_ to be exposed to the client
 */
interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_VERSION: string;

  // Environment
  readonly VITE_NODE_ENV: 'development' | 'production' | 'test';

  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;

  // Feature Flags
  readonly VITE_ENABLE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
