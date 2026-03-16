import 'dotenv/config';
import * as joi from 'joi';
import { EnvInterface } from './env.interface';

const envSchema = joi.object({
  // Server Configuration
  appPort: joi.number().required(),
  nodeEnv: joi.string().valid('development', 'production', 'test').default('development'),

  // NATS Configuration
  msNatsServer: joi.array().items(joi.string()).required(),

  // JWT Configuration
  jwtSecret: joi.string().required(),
  jwtExpiresIn: joi.string().default('60s'),
  jwtRefreshIn: joi.string().default('7d'), 

  // Database Configuration
  dbHost: joi.string().required(),
  dbPort: joi.number().required(),
  dbUser: joi.string().required(),
  dbPassword: joi.string().required(),
  dbName: joi.string().required(),
  dbSsl: joi.boolean().required(),
  dbConnTimeoutMs: joi.number().min(1000).max(30000).default(5000),
  dbIdleTimeoutMs: joi.number().min(1000).max(60000).default(30000),
  dbMaxPool: joi.number().min(1).max(100).default(30),
  dbStatementTimeoutMs: joi.number().min(1000).max(60000).default(30000),

  // Database Pool Configuration
  dbPoolSize: joi.number().min(1).max(100).default(30),
  dbConnectionTimeout: joi.number().min(1000).max(30000).default(5000),
  dbIdleTimeout: joi.number().min(1000).max(60000).default(30000),
  dbMaxUses: joi.number().min(1000).max(10000).default(7500),
}).unknown(true);

const { error, value } = envSchema.validate({
  ...process.env,
  msNatsServer: process.env.msNatsServer?.split(','),
  appPort: parseInt(process.env.appPort || '8000'),
  dbPort: parseInt(process.env.dbPort || '6432'),
  dbSsl: process.env.dbSsl === 'true',
  dbConnTimeoutMs: parseInt(process.env.dbConnTimeoutMs || '5000'),
  dbIdleTimeoutMs: parseInt(process.env.dbIdleTimeoutMs || '30000'),
  dbMaxPool: parseInt(process.env.dbMaxPool || '30'),
  dbStatementTimeoutMs: parseInt(process.env.dbStatementTimeoutMs || '30000'),
  dbPoolSize: parseInt(process.env.dbPoolSize || '30'),
  dbConnectionTimeout: parseInt(process.env.dbConnectionTimeout || '5000'),
  dbIdleTimeout: parseInt(process.env.dbIdleTimeout || '30000'),
  dbMaxUses: parseInt(process.env.dbMaxUses || '7500'),
});

if (error) {
  throw new Error(`Configuración de validación error: ${error.message}`);
}

const envVars: EnvInterface = value;

export const envs = {
  port: envVars.appPort,
  nodeEnv: envVars.nodeEnv,
  ms: {
    natsServer: envVars.msNatsServer,
  },
  jwt: {
    secret: envVars.jwtSecret,
    expiresIn: envVars.jwtExpiresIn,
    refreshIn: envVars.jwtRefreshIn,
  },
  db: {
    host: envVars.dbHost,
    port: envVars.dbPort,
    username: envVars.dbUser,
    password: envVars.dbPassword,
    name: envVars.dbName,
    ssl: envVars.dbSsl,
    pool: {
      size: envVars.dbPoolSize,
      connectionTimeout: envVars.dbConnectionTimeout,
      idleTimeout: envVars.dbIdleTimeout,
      maxUses: envVars.dbMaxUses,
    },
    connTimeout: envVars.dbConnTimeoutMs,
    idleTimeout: envVars.dbIdleTimeoutMs,
    maxPool: envVars.dbMaxPool,
    statementTimeout: envVars.dbStatementTimeoutMs,
  },
  logging: {
    level: envVars.logLevel,
    format: envVars.logFormat,
  },
};
