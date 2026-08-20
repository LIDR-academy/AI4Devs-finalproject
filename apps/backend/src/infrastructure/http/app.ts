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

// Swagger UI - Documentacion Interactiva de API REST (OpenAPI 3.1)
function setupSwaggerDocs(app: Express): void {
  const openApiPath = path.resolve(process.cwd(), 'docs/03_persistence_and_api/openapi.yaml');
  const fallbackPath = path.resolve(process.cwd(), '../../docs/03_persistence_and_api/openapi.yaml');
  const finalOpenApiPath = fs.existsSync(openApiPath) ? openApiPath : (fs.existsSync(fallbackPath) ? fallbackPath : null);
  if (!finalOpenApiPath) {
    return;
  }

  try {
    const swaggerDocument = YAML.load(finalOpenApiPath);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (err) {
    console.warn('⚠️ No se pudo cargar Swagger UI desde openapi.yaml:', err);
  }
}

// Fail-Fast Environment Validation for JWT Secret (Guard 14).
// Solo "test" tiene excepción: Vitest fija NODE_ENV=test automáticamente y los
// tests de integración dependen de un secreto conocido sin tener que declararlo
// en cada suite. Cualquier otro entorno (development, staging, production, o
// NODE_ENV sin definir) exige un JWT_SECRET real — nunca un fallback hardcodeado
// en el repositorio, que sería trivialmente conocido por cualquiera con el código.
function assertJwtSecretConfigured(options: AppOptions): void {
  const isTestEnv = process.env.NODE_ENV === 'test';
  if (!isTestEnv && !options.jwtSecret && !process.env.JWT_SECRET) {
    throw new Error(
      'CONFIG FATAL: Variable de entorno JWT_SECRET es obligatoria fuera del entorno de test (Guard 14 Fail-Fast Secrets).'
    );
  }
}

interface AppRepositories {
  userRepo: IUserRepository;
  jwtSecret: string;
  stockRepo: IStockRepository;
  remanenteQueryRepo: IRemanenteQueryRepository;
  reportRepo: IReportRepository;
  recipeRepo: IRecipeRepository;
  reconciliationRepo: IShiftReconciliationRepository;
}

// Repositorios e inyeccion de dependencias por defecto para dev/standalone
function buildDefaultRepositories(options: AppOptions): AppRepositories {
  const stockRepo = options.stockRepository ?? new InMemoryStockRepository();
  return {
    userRepo: options.userRepository ?? new InMemoryUserRepository(),
    jwtSecret: options.jwtSecret ?? process.env.JWT_SECRET ?? 'restostock-test-only-jwt-secret',
    stockRepo,
    remanenteQueryRepo:
      options.remanenteQueryRepository ?? new InMemoryRemanenteQueryRepository(stockRepo as InMemoryStockRepository),
    reportRepo: options.reportRepository ?? new InMemoryReportRepository(),
    recipeRepo: options.recipeRepository ?? new InMemoryRecipeRepository(),
    reconciliationRepo: options.reconciliationRepository ?? new InMemoryShiftReconciliationRepository(),
  };
}

// Sembrado de Datos Desacoplado e Idempotente (SK-28)
function triggerDevSeedingIfNeeded(repos: AppRepositories, options: AppOptions): void {
  const shouldSeed = options.enableDevSeeding ?? (!options.userRepository && process.env.NODE_ENV !== 'test');
  if (!shouldSeed) {
    return;
  }

  const { userRepo, stockRepo, remanenteQueryRepo, recipeRepo } = repos;
  runSeed(
    { userRepo, stockRepo, remanenteQueryRepo, recipeRepo },
    { includeSyntheticFixtures: process.env.NODE_ENV !== 'production' }
  ).catch((err) => console.warn('⚠️ Advertencia ejecutando seeding:', err));
}

// Rutas Protegidas de Control de Bodega y Stock (Guard 15): las rutas exigen JWT
// SIEMPRE por defecto, sin importar NODE_ENV. Un test de negocio que legítimamente
// necesite aislar la lógica de auth debe pasar requireAuth:false explícito.
function mountApiRoutes(
  app: Express,
  repos: AppRepositories,
  authMiddleware: ReturnType<typeof createAuthenticateJWTMiddleware>,
  isAuthRequired: boolean
): void {
  const { stockRepo, remanenteQueryRepo, recipeRepo, reconciliationRepo, reportRepo } = repos;
  const guard = isAuthRequired ? [authMiddleware] : [];

  app.use('/api/v1/stock', ...guard, createStockRouter(stockRepo));
  app.use('/api/v1/kitchen', ...guard, createKitchenRouter(remanenteQueryRepo, stockRepo, recipeRepo, reconciliationRepo));
  app.use('/api/v1/reports', ...guard, createReportsRouter(reportRepo));
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  setupSwaggerDocs(app);

  // Endpoint de salud
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      system: 'RestoStock Backend Core',
      docs: '/docs',
      timestamp: new Date().toISOString(),
    });
  });

  assertJwtSecretConfigured(options);

  const repos = buildDefaultRepositories(options);
  triggerDevSeedingIfNeeded(repos, options);

  const authMiddleware = createAuthenticateJWTMiddleware(repos.jwtSecret);
  const isAuthRequired = options.requireAuth ?? true;

  app.use('/api/v1/auth', createAuthRouter(repos.userRepo, repos.jwtSecret));
  mountApiRoutes(app, repos, authMiddleware, isAuthRequired);

  // Middleware global de errores
  app.use(errorHandler);

  return app;
}
