/**
 * Setup de variables de entorno para tests E2E
 * Este archivo debe ejecutarse antes de importar AppModule
 */

// Configurar variables de entorno para tests E2E
process.env.appPort = process.env.appPort || '8000';
process.env.nodeEnv = 'test';
process.env.msNatsServer = process.env.msNatsServer || 'nats://localhost:4222';
process.env.dbHost = process.env.dbHost || 'localhost';
process.env.dbPort = process.env.dbPort || '5432';
process.env.dbUser = process.env.dbUser || 'test';
process.env.dbPassword = process.env.dbPassword || 'test';
process.env.dbName = process.env.dbName || 'test_db';
process.env.dbSsl = process.env.dbSsl || 'false';
process.env.dbConnTimeoutMs = process.env.dbConnTimeoutMs || '5000';
process.env.dbIdleTimeoutMs = process.env.dbIdleTimeoutMs || '30000';
process.env.dbMaxPool = process.env.dbMaxPool || '10';
process.env.dbStatementTimeoutMs = process.env.dbStatementTimeoutMs || '30000';
process.env.dbPoolSize = process.env.dbPoolSize || '10';
process.env.dbConnectionTimeout = process.env.dbConnectionTimeout || '5000';
process.env.dbIdleTimeout = process.env.dbIdleTimeout || '30000';
process.env.dbMaxUses = process.env.dbMaxUses || '7500';
process.env.jwtAccessSecret = process.env.jwtAccessSecret || 'test-access-secret-key-for-e2e-tests';
process.env.jwtAccessExpiresIn = process.env.jwtAccessExpiresIn || '1h';
process.env.jwtRefreshSecret = process.env.jwtRefreshSecret || 'test-refresh-secret-key-for-e2e-tests';
process.env.jwtRefreshExpiresIn = process.env.jwtRefreshExpiresIn || '7d';
process.env.logLevel = process.env.logLevel || 'error'; // Reducir logs en tests
process.env.logFormat = process.env.logFormat || 'text';

