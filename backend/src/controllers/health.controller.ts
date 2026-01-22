import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';

export const healthController = {
  check: async (_req: Request, res: Response) => {
    try {
      // Verificar conexión a base de datos
      const isDbConnected = AppDataSource.isInitialized;

      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: isDbConnected ? 'connected' : 'disconnected',
        version: '1.0.0',
      };

      const statusCode = isDbConnected ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  },
};
