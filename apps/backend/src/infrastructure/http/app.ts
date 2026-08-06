import express, { Express } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createStockRouter } from '../stock/http/routes/stock.routes.js';
import { createKitchenRouter } from '../kitchen/http/routes/kitchen.routes.js';
import { IUserRepository } from '../../domain/auth/repositories/IUserRepository.js';
import { IStockRepository } from '../../domain/stock/repositories/IStockRepository.js';
import { IRemanenteQueryRepository } from '../../domain/kitchen/repositories/IRemanenteQueryRepository.js';

export interface AppOptions {
  userRepository?: IUserRepository;
  stockRepository?: IStockRepository;
  remanenteQueryRepository?: IRemanenteQueryRepository;
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

  // Rutas de Autenticacion
  if (options.userRepository && options.jwtSecret) {
    app.use('/api/v1/auth', createAuthRouter(options.userRepository, options.jwtSecret));
  }

  // Rutas de Control de Bodega y Stock
  if (options.stockRepository) {
    app.use('/api/v1/stock', createStockRouter(options.stockRepository));
  }

  // Rutas de Servicio y Remanentes de Cocina
  if (options.remanenteQueryRepository) {
    app.use('/api/v1/kitchen', createKitchenRouter(options.remanenteQueryRepository));
  }

  // Middleware global de errores
  app.use(errorHandler);

  return app;
}
