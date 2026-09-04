import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { errorHandler } from './middlewares/errorHandler.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createStockRouter } from '../stock/http/routes/stock.routes.js';
import { createKitchenRouter } from '../kitchen/http/routes/kitchen.routes.js';
import { createReportsRouter } from '../reports/http/routes/reports.routes.js';
import { createRecipesRouter } from '../recipes/http/routes/recipes.routes.js';
import { InMemoryUserRepository } from '../auth/repositories/InMemoryUserRepository.js';
import { InMemoryStockRepository } from '../stock/repositories/InMemoryStockRepository.js';
import { InMemoryRemanenteQueryRepository } from '../kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { InMemoryReportRepository } from '../reports/repositories/InMemoryReportRepository.js';
import { InMemoryRecipeRepository } from '../recipes/repositories/InMemoryRecipeRepository.js';
import { InMemoryRecipePreparationRepository } from '../kitchen/repositories/InMemoryRecipePreparationRepository.js';
import { IRecipePreparationRepository } from '../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { IUserRepository } from '../../domain/auth/repositories/IUserRepository.js';
import { IInsumoRepository } from '../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository } from '../../domain/stock/repositories/IRemanenteRepository.js';
import { IStockUnitOfWork } from '../../domain/stock/repositories/IStockUnitOfWork.js';
import { IStockMovementQueryRepository } from '../../domain/stock/repositories/IStockMovementQueryRepository.js';
import { InMemoryStockMovementQueryRepository } from '../stock/repositories/InMemoryStockMovementQueryRepository.js';
import { IRemanenteQueryRepository } from '../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IReportRepository } from '../../domain/reports/repositories/IReportRepository.js';
import { IRecipeRepository } from '../../domain/recipes/repositories/IRecipeRepository.js';

import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { runSeed } from '../seeds/seed.js';

import { createAuthenticateJWTMiddleware } from './middlewares/authenticateJWT.js';
import { createRateLimiter } from './middlewares/rateLimiter.js';
import { IShiftReconciliationRepository } from '../../domain/kitchen/repositories/IShiftReconciliationRepository.js';
import { InMemoryShiftReconciliationRepository } from '../kitchen/repositories/InMemoryShiftReconciliationRepository.js';

import { IRoleRepository } from '../../domain/security/repositories/IRoleRepository.js';
import { InMemoryRoleRepository } from '../security/repositories/InMemoryRoleRepository.js';
import { createRolesController } from '../security/http/controllers/roles.controller.js';

import { IStorageLocationRepository } from '../../domain/stock/repositories/IStorageLocationRepository.js';
import { InMemoryLocationRepository } from '../stock/repositories/InMemoryLocationRepository.js';
import { createLocationsController } from '../stock/http/controllers/locations.controller.js';

import { ISystemSettingsRepository } from '../../domain/settings/repositories/ISystemSettingsRepository.js';
import { InMemorySettingsRepository } from '../settings/repositories/InMemorySettingsRepository.js';
import { createSettingsController } from '../settings/http/controllers/settings.controller.js';
import { IEmailService } from '../../domain/auth/ports/IEmailService.js';

import { IConsumptionReasonRepository } from '../../domain/kitchen/repositories/IConsumptionReasonRepository.js';
import { InMemoryConsumptionReasonRepository } from '../kitchen/repositories/InMemoryConsumptionReasonRepository.js';
import { createConsumptionReasonsController } from '../kitchen/http/controllers/consumption-reasons.controller.js';
import { cryptoIdGenerator } from '../shared/cryptoIdGenerator.js';

export interface AppOptions {
  userRepository?: IUserRepository;
  emailService?: IEmailService;
  stockRepository?: IInsumoRepository & IRemanenteRepository & IStockUnitOfWork;
  stockMovementQueryRepository?: IStockMovementQueryRepository;
  remanenteQueryRepository?: IRemanenteQueryRepository;
  reportRepository?: IReportRepository;
  recipeRepository?: IRecipeRepository;
  reconciliationRepository?: IShiftReconciliationRepository;
  recipePreparationRepository?: IRecipePreparationRepository;
  roleRepository?: IRoleRepository;
  locationRepository?: IStorageLocationRepository;
  settingsRepository?: ISystemSettingsRepository;
  consumptionReasonRepository?: IConsumptionReasonRepository;
  jwtSecret?: string;
  corsAllowedOrigins?: string;
  rateLimit?: { windowMs: number; max: number };
  enableDevSeeding?: boolean;
  enableSwagger?: boolean;
  requireAuth?: boolean;
}


// CORS_ALLOWED_ORIGINS es "*" (dev/test) o una lista separada por comas de origenes exactos
// (produccion — Guard 14 ya prohibe "*" ahi vía Fail-Fast en environment.ts). Antes de este
// fix, `app.use(cors())` ignoraba esta variable por completo: se validaba estrictamente pero
// el middleware real seguia aceptando cualquier origen sin importar el valor configurado.
function resolveCorsOrigin(raw: string | undefined): string | string[] {
  const value = raw ?? '*';
  if (value === '*') {
    return '*';
  }
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

// RATE_LIMIT_WINDOW_MS/RATE_LIMIT_MAX_REQUESTS estaban validadas en environment.ts pero no
// las leia ningun middleware — la unica limitacion real era el limiter hardcodeado del login
// (windowMs: 15min, max: 10, ver auth.routes.ts). Estos valores alimentan un limiter GLOBAL
// para /api/v1/*, mas laxo (default 100/15min) que el de login, que se mantiene sin tocar
// para no debilitar la proteccion anti-fuerza-bruta existente.
function resolveRateLimitOptions(raw: AppOptions['rateLimit']): { windowMs: number; max: number } {
  if (raw) {
    return raw;
  }
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10);
  const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10);
  return { windowMs, max };
}

function isSwaggerEnabled(options: AppOptions): boolean {
  if (options.enableSwagger !== undefined) {
    return options.enableSwagger;
  }
  if (process.env.ENABLE_SWAGGER !== undefined) {
    return process.env.ENABLE_SWAGGER === 'true';
  }
  // En produccion se deshabilita por defecto para mitigar Information Disclosure
  return process.env.NODE_ENV !== 'production';
}

// Swagger UI - Documentacion Interactiva de API REST (OpenAPI 3.1)
function setupSwaggerDocs(app: Express, enabled: boolean): boolean {
  if (!enabled) {
    return false;
  }

  const openApiPath = path.resolve(process.cwd(), 'docs/03_persistence_and_api/openapi.yaml');
  const fallbackPath = path.resolve(process.cwd(), '../../docs/03_persistence_and_api/openapi.yaml');
  const finalOpenApiPath = fs.existsSync(openApiPath) ? openApiPath : (fs.existsSync(fallbackPath) ? fallbackPath : null);
  if (!finalOpenApiPath) {
    return false;
  }

  try {
    const swaggerDocument = YAML.load(finalOpenApiPath);
    // CSP Aislado especificamente para Swagger UI sin debilitar la API global
    const swaggerCsp = helmet.contentSecurityPolicy({
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:'],
      },
    });

    app.use('/docs', swaggerCsp, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api-docs', swaggerCsp, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    return true;
  } catch (err) {
    console.warn('⚠️ No se pudo cargar Swagger UI desde openapi.yaml:', err);
    return false;
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
  stockRepo: IInsumoRepository & IRemanenteRepository & IStockUnitOfWork;
  stockMovementQueryRepo: IStockMovementQueryRepository;
  remanenteQueryRepo: IRemanenteQueryRepository;
  reportRepo: IReportRepository;
  recipeRepo: IRecipeRepository;
  reconciliationRepo: IShiftReconciliationRepository;
  recipePreparationRepo: IRecipePreparationRepository;
  roleRepo: IRoleRepository;
  locationRepo: IStorageLocationRepository;
  settingsRepo: ISystemSettingsRepository;
  consumptionReasonRepo: IConsumptionReasonRepository;
}

function buildQueryRepositories(
  options: AppOptions,
  stockRepo: IInsumoRepository & IRemanenteRepository & IStockUnitOfWork
) {
  const stockInMemory = stockRepo as InMemoryStockRepository;
  return {
    stockMovementQueryRepo:
      options.stockMovementQueryRepository ?? new InMemoryStockMovementQueryRepository(stockInMemory),
    remanenteQueryRepo:
      options.remanenteQueryRepository ?? new InMemoryRemanenteQueryRepository(stockInMemory),
  };
}

function buildAuxiliaryRepositories(options: AppOptions) {
  return {
    roleRepo: options.roleRepository ?? new InMemoryRoleRepository(),
    locationRepo: options.locationRepository ?? new InMemoryLocationRepository(),
    settingsRepo: options.settingsRepository ?? new InMemorySettingsRepository(),
    consumptionReasonRepo: options.consumptionReasonRepository ?? new InMemoryConsumptionReasonRepository(),
  };
}

// Repositorios e inyeccion de dependencias por defecto para dev/standalone
function buildDefaultRepositories(options: AppOptions): AppRepositories {
  const stockRepo = options.stockRepository ?? new InMemoryStockRepository();
  const queryRepos = buildQueryRepositories(options, stockRepo);
  const recipePreparationRepo =
    options.recipePreparationRepository ??
    new InMemoryRecipePreparationRepository(stockRepo as InMemoryStockRepository);
  const auxRepos = buildAuxiliaryRepositories(options);
  return {
    userRepo: options.userRepository ?? new InMemoryUserRepository(),
    jwtSecret: options.jwtSecret ?? process.env.JWT_SECRET ?? 'restostock-test-only-jwt-secret',
    stockRepo,
    ...queryRepos,
    ...auxRepos,
    reportRepo: options.reportRepository ?? new InMemoryReportRepository(),
    recipeRepo: options.recipeRepository ?? new InMemoryRecipeRepository(),
    reconciliationRepo: options.reconciliationRepository ?? new InMemoryShiftReconciliationRepository(),
    recipePreparationRepo,
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
  const { stockRepo, stockMovementQueryRepo, remanenteQueryRepo, recipeRepo, reconciliationRepo, recipePreparationRepo, reportRepo, roleRepo, locationRepo, settingsRepo, consumptionReasonRepo } = repos;
  const guard = isAuthRequired ? [authMiddleware] : [];

  app.use('/api/v1/stock', ...guard, createStockRouter(stockRepo, stockMovementQueryRepo, isAuthRequired, locationRepo, recipePreparationRepo));
  app.use('/api/v1/kitchen', ...guard, createKitchenRouter(remanenteQueryRepo, stockRepo, recipeRepo, reconciliationRepo, isAuthRequired, recipePreparationRepo, stockRepo, locationRepo, consumptionReasonRepo, settingsRepo));
  app.use('/api/v1/reports', ...guard, createReportsRouter(reportRepo, settingsRepo));
  app.use('/api/v1/recipes', ...guard, createRecipesRouter(recipeRepo, stockRepo));
  app.use('/api/v1/roles', ...guard, createRolesController(roleRepo));
  app.use('/api/v1/locations', ...guard, createLocationsController(locationRepo, isAuthRequired, stockRepo));
  app.use('/api/v1/settings', ...guard, createSettingsController(settingsRepo));
  // US-030: catálogo de motivos de consumo — lectura para cualquier autenticado,
  // mutación y `includeInactive` solo ADMIN (gateado dentro del propio controller).
  app.use('/api/v1/consumption-reasons', ...guard, createConsumptionReasonsController(consumptionReasonRepo, cryptoIdGenerator, isAuthRequired));
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();

  // Helmet estricto activo por defecto a nivel global (HSTS, NoSniff, Frameguard, etc.)
  app.use(helmet());
  app.use(cors({ origin: resolveCorsOrigin(options.corsAllowedOrigins ?? process.env.CORS_ALLOWED_ORIGINS) }));

  app.use(express.json());
  const swaggerActive = setupSwaggerDocs(app, isSwaggerEnabled(options));

  // Endpoint de salud
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      system: 'RestoStock Backend Core',
      docs: swaggerActive ? '/docs' : 'disabled',
      timestamp: new Date().toISOString(),
    });
  });


  assertJwtSecretConfigured(options);

  const repos = buildDefaultRepositories(options);
  triggerDevSeedingIfNeeded(repos, options);

  const authMiddleware = createAuthenticateJWTMiddleware(repos.jwtSecret);
  const isAuthRequired = options.requireAuth ?? true;

  // Rate limiting global para /api/v1/* (Guard 16) — el login mantiene ademas su propio
  // limiter mas estricto, aplicado despues de este en la cadena de middlewares.
  app.use('/api/v1', createRateLimiter(resolveRateLimitOptions(options.rateLimit)));

  app.use('/api/v1/auth', createAuthRouter(repos.userRepo, repos.jwtSecret, options.emailService));
  mountApiRoutes(app, repos, authMiddleware, isAuthRequired);

  // Middleware global de errores
  app.use(errorHandler);

  return app;
}
