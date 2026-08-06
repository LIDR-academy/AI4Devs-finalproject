import express, { Express } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { IUserRepository } from '../../domain/auth/repositories/IUserRepository.js';

export interface AppOptions {
  userRepository?: IUserRepository;
  jwtSecret?: string;
}

export function createApp(options: AppOptions = {}): Express {
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

  // Rutas de Autenticacion si el repositorio esta presente
  if (options.userRepository && options.jwtSecret) {
    app.use('/api/v1/auth', createAuthRouter(options.userRepository, options.jwtSecret));
  }

  // Middleware global de errores
  app.use(errorHandler);

  return app;
}
