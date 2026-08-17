import express, { Express } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createStockRouter } from '../stock/http/routes/stock.routes.js';
import { createKitchenRouter } from '../kitchen/http/routes/kitchen.routes.js';
import { createReportsRouter } from '../reports/http/routes/reports.routes.js';
import { InMemoryUserRepository } from '../auth/repositories/InMemoryUserRepository.js';
import { InMemoryStockRepository } from '../stock/repositories/InMemoryStockRepository.js';
import { InMemoryRemanenteQueryRepository } from '../kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { InMemoryReportRepository } from '../reports/repositories/InMemoryReportRepository.js';
import { InMemoryRecipeRepository } from '../catalog/repositories/InMemoryRecipeRepository.js';
import { IUserRepository } from '../../domain/auth/repositories/IUserRepository.js';
import { IStockRepository } from '../../domain/stock/repositories/IStockRepository.js';
import { IRemanenteQueryRepository } from '../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IReportRepository } from '../../domain/reports/repositories/IReportRepository.js';
import { IRecipeRepository } from '../../domain/catalog/repositories/IRecipeRepository.js';

import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { runSeed } from '../seeds/seed.js';

export interface AppOptions {
  userRepository?: IUserRepository;
  stockRepository?: IStockRepository;
  remanenteQueryRepository?: IRemanenteQueryRepository;
  reportRepository?: IReportRepository;
  recipeRepository?: IRecipeRepository;
  jwtSecret?: string;
  enableDevSeeding?: boolean;
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Swagger UI - Documentación Interactiva de API REST (OpenAPI 3.1)
  const openApiPath = path.resolve(process.cwd(), 'docs/03_persistence_and_api/openapi.yaml');
  const fallbackPath = path.resolve(process.cwd(), '../../docs/03_persistence_and_api/openapi.yaml');
  const finalOpenApiPath = fs.existsSync(openApiPath) ? openApiPath : (fs.existsSync(fallbackPath) ? fallbackPath : null);

  if (finalOpenApiPath) {
    try {
      const swaggerDocument = YAML.load(finalOpenApiPath);
      app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    } catch (err) {
      console.warn('⚠️ No se pudo cargar Swagger UI desde openapi.yaml:', err);
    }
  }

  // Endpoint de salud
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      system: 'RestoStock Backend Core',
      docs: '/docs',
      timestamp: new Date().toISOString(),
    });
  });

  // Repositorios e inyección de dependencias por defecto para dev/standalone
  const userRepo = options.userRepository ?? new InMemoryUserRepository();
  const jwtSecret = options.jwtSecret ?? process.env.JWT_SECRET ?? 'restostock-super-secret-jwt-key-2026';
  const stockRepo = options.stockRepository ?? new InMemoryStockRepository();
  const remanenteQueryRepo = options.remanenteQueryRepository ?? new InMemoryRemanenteQueryRepository();
  const reportRepo = options.reportRepository ?? new InMemoryReportRepository();
  const recipeRepo = options.recipeRepository ?? new InMemoryRecipeRepository();

  // Sembrado de Datos Desacoplado e Idempotente (SK-28)
  const shouldSeed = options.enableDevSeeding ?? (!options.userRepository && process.env.NODE_ENV !== 'test');
  if (shouldSeed) {
    runSeed(
      { userRepo, stockRepo, remanenteQueryRepo, recipeRepo },
      { includeSyntheticFixtures: process.env.NODE_ENV !== 'production' }
    ).catch((err) => console.warn('⚠️ Advertencia ejecutando seeding:', err));
  }

  // Rutas de Autenticacion
  app.use('/api/v1/auth', createAuthRouter(userRepo, jwtSecret));

  // Rutas de Control de Bodega y Stock
  app.use('/api/v1/stock', createStockRouter(stockRepo));

  // Rutas de Servicio y Remanentes de Cocina
  app.use('/api/v1/kitchen', createKitchenRouter(remanenteQueryRepo, stockRepo, recipeRepo));

  // Rutas de Reportes
  app.use('/api/v1/reports', createReportsRouter(reportRepo));

  // Middleware global de errores
  app.use(errorHandler);

  return app;
}
