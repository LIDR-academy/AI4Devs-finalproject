export interface EnvInterface {
  // Server Configuration
  appPort: number;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigin: string;

  // NATS Configuration
  msNatsServer: string[];

  // Database Configuration
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  dbSsl: boolean;
  dbConnTimeoutMs: number;
  dbIdleTimeoutMs: number;
  dbMaxPool: number;
  dbStatementTimeoutMs: number;

  // Database Pool Configuration
  dbPoolSize: number;
  dbConnectionTimeout: number;
  dbIdleTimeout: number;
  dbMaxUses: number;

  // Logging Configuration
  logLevel: string;
  logFormat: string;

  // Throttle Configuration
  throttleMaxRequestsPerIp: number;
  throttleBanDuration: number;

  // Circuit Breaker Configuration
  circuitBreakerTimeout: number;
  circuitBreakerErrorThresholdPercentage: number;
  circuitBreakerResetTimeout: number;
}
