import dotenv from 'dotenv';

dotenv.config();

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  ALGORITHM: 'HS256'
} as const;

export const JWT_OPTIONS = {
  expiresIn: JWT_CONFIG.EXPIRES_IN,
  algorithm: JWT_CONFIG.ALGORITHM
} as const;
