import express, { Express } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Endpoint de salud
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      system: 'RestoStock Backend Core',
      timestamp: new Date().toISOString(),
    });
  });

  // Middleware global de errores
  app.use(errorHandler);

  return app;
}
