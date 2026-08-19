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

import { createAuthenticateJWTMiddleware } from './middlewares/authenticateJWT.js';
import { IShiftReconciliationRepository } from '../../domain/kitchen/repositories/IShiftReconciliationRepository.js';
import { InMemoryShiftReconciliationRepository } from '../kitchen/repositories/InMemoryShiftReconciliationRepository.js';

export interface AppOptions {
  userRepository?: IUserRepository;
  stockRepository?: IStockRepository;
  remanenteQueryRepository?: IRemanenteQueryRepository;
  reportRepository?: IReportRepository;
  recipeRepository?: IRecipeRepository;
  reconciliationRepository?: IShiftReconciliationRepository;
  jwtSecret?: string;
  enableDevSeeding?: boolean;
  requireAuth?: boolean;
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Swagger UI - Documentacion Interactiva de API REST (OpenAPI 3.1)
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

  // Fail-Fast Environment Validation for JWT Secret (Guard 14).
  // Solo "test" tiene excepción: Vitest fija NODE_ENV=test automáticamente y los
  // tests de integración dependen de un secreto conocido sin tener que declararlo
  // en cada suite. Cualquier otro entorno (development, staging, production, o
  // NODE_ENV sin definir) exige un JWT_SECRET real — nunca un fallback hardcodeado
  // en el repositorio, que sería trivialmente conocido por cualquiera con el código.
  const isTestEnv = process.env.NODE_ENV === 'test';
  if (!isTestEnv && !options.jwtSecret && !process.env.JWT_SECRET) {
    throw new Error(
      'CONFIG FATAL: Variable de entorno JWT_SECRET es obligatoria fuera del entorno de test (Guard 14 Fail-Fast Secrets).'
    );
  }

  // Repositorios e inyeccion de dependencias por defecto para dev/standalone
  const userRepo = options.userRepository ?? new InMemoryUserRepository();
  const jwtSecret = options.jwtSecret ?? process.env.JWT_SECRET ?? 'restostock-test-only-jwt-secret';
  const stockRepo = options.stockRepository ?? new InMemoryStockRepository();
  const remanenteQueryRepo = options.remanenteQueryRepository ?? new InMemoryRemanenteQueryRepository(stockRepo as InMemoryStockRepository);
  const reportRepo = options.reportRepository ?? new InMemoryReportRepository();
  const recipeRepo = options.recipeRepository ?? new InMemoryRecipeRepository();
  const reconciliationRepo = options.reconciliationRepository ?? new InMemoryShiftReconciliationRepository();

  // Sembrado de Datos Desacoplado e Idempotente (SK-28)
  const shouldSeed = options.enableDevSeeding ?? (!options.userRepository && process.env.NODE_ENV !== 'test');
  if (shouldSeed) {
    runSeed(
      { userRepo, stockRepo, remanenteQueryRepo, recipeRepo },
      { includeSyntheticFixtures: process.env.NODE_ENV !== 'production' }
    ).catch((err) => console.warn('⚠️ Advertencia ejecutando seeding:', err));
  }

  const authMiddleware = createAuthenticateJWTMiddleware(jwtSecret);
  // Guard 15: las rutas protegidas exigen JWT SIEMPRE por defecto, sin importar NODE_ENV.
  // Antes esto solo se activaba en NODE_ENV==='production', dejando cualquier despliegue
  // de development/staging/sin-definir totalmente abierto. Un test de negocio que
  // legítimamente necesite aislar la lógica de auth debe pasar requireAuth:false explícito.
  const isAuthRequired = options.requireAuth ?? true;

  // Rutas de Autenticacion
  app.use('/api/v1/auth', createAuthRouter(userRepo, jwtSecret));

  // Rutas Protegidas de Control de Bodega y Stock (Guard 15)
  if (isAuthRequired) {
    app.use('/api/v1/stock', authMiddleware, createStockRouter(stockRepo));
    app.use('/api/v1/kitchen', authMiddleware, createKitchenRouter(remanenteQueryRepo, stockRepo, recipeRepo, reconciliationRepo));
    app.use('/api/v1/reports', authMiddleware, createReportsRouter(reportRepo));
  } else {
    app.use('/api/v1/stock', createStockRouter(stockRepo));
    app.use('/api/v1/kitchen', createKitchenRouter(remanenteQueryRepo, stockRepo, recipeRepo, reconciliationRepo));
    app.use('/api/v1/reports', createReportsRouter(reportRepo));
  }

  // Middleware global de errores
  app.use(errorHandler);

  return app;
}
