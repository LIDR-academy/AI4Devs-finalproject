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
import { User } from '../../domain/auth/entities/User.js';
import { Pin } from '../../domain/auth/value-objects/Pin.js';
import { Insumo } from '../../domain/stock/entities/Insumo.js';
import { Recipe } from '../../domain/catalog/entities/Recipe.js';
import { RecipeIngredient } from '../../domain/catalog/entities/RecipeIngredient.js';
import { DecimalQuantity } from '../../domain/stock/value-objects/DecimalQuantity.js';
import { IUserRepository } from '../../domain/auth/repositories/IUserRepository.js';
import { IStockRepository } from '../../domain/stock/repositories/IStockRepository.js';
import { IRemanenteQueryRepository } from '../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IReportRepository } from '../../domain/reports/repositories/IReportRepository.js';
import { IRecipeRepository } from '../../domain/catalog/repositories/IRecipeRepository.js';

import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

export interface AppOptions {
  userRepository?: IUserRepository;
  stockRepository?: IStockRepository;
  remanenteQueryRepository?: IRemanenteQueryRepository;
  reportRepository?: IReportRepository;
  recipeRepository?: IRecipeRepository;
  jwtSecret?: string;
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

  // Sembrar usuarios iniciales si se usan repositorios en memoria por defecto
  if (!options.userRepository && userRepo instanceof InMemoryUserRepository) {
    userRepo.seedUser(
      new User({
        id: 'usr-carlos-1',
        name: 'Carlos Gomez (Cocina)',
        role: 'KITCHEN_STAFF',
        pin: Pin.createFromRaw('1234'),
        status: 'ACTIVE',
        failedAttempts: 0,
      })
    );
    userRepo.seedUser(
      new User({
        id: 'usr-maria-2',
        name: 'Maria Silva (Administrador)',
        role: 'ADMIN',
        pin: Pin.createFromRaw('1234'),
        status: 'ACTIVE',
        failedAttempts: 0,
      })
    );
  }

  // Sembrar insumos de bodega si se usan repositorios en memoria por defecto
  if (!options.stockRepository && stockRepo instanceof InMemoryStockRepository) {
    stockRepo.seedInsumo(
      new Insumo({
        id: 'ins-1',
        name: 'Queso Mozzarella',
        unitOfMeasure: 'KG',
        warehouseStock: new DecimalQuantity('50.0000'),
      })
    );
    stockRepo.seedInsumo(
      new Insumo({
        id: 'ins-2',
        name: 'Salsa Pomodoro',
        unitOfMeasure: 'L',
        warehouseStock: new DecimalQuantity('50.0000'),
      })
    );
    stockRepo.seedInsumo(
      new Insumo({
        id: 'ins-3',
        name: 'Masa de Pizza',
        unitOfMeasure: 'UNITS',
        warehouseStock: new DecimalQuantity('100.0000'),
      })
    );
  }

  // Sembrar recetas si se usa repositorio de recetas en memoria por defecto
  if (!options.recipeRepository && recipeRepo instanceof InMemoryRecipeRepository) {
    const pizzaRecipe = new Recipe(
      'rec-pizza-margarita',
      'Pizza Margarita',
      'PIZZA',
      [
        new RecipeIngredient('ing-1', 'rec-pizza-margarita', 'ins-1', new DecimalQuantity('0.1500')),
        new RecipeIngredient('ing-2', 'rec-pizza-margarita', 'ins-2', new DecimalQuantity('0.1000')),
        new RecipeIngredient('ing-3', 'rec-pizza-margarita', 'ins-3', new DecimalQuantity('1.0000')),
      ],
      'Pizza clásica con salsa pomodoro, queso mozzarella y albaca'
    );
    recipeRepo.save(pizzaRecipe);

    const pizzaRec1 = new Recipe(
      'rec-1',
      'Pizza Margarita',
      'PIZZA',
      [
        new RecipeIngredient('ing-1', 'rec-1', 'ins-1', new DecimalQuantity('0.1500')),
        new RecipeIngredient('ing-2', 'rec-1', 'ins-2', new DecimalQuantity('0.1000')),
        new RecipeIngredient('ing-3', 'rec-1', 'ins-3', new DecimalQuantity('1.0000')),
      ]
    );
    recipeRepo.save(pizzaRec1);
  }

  // Sembrar remanentes iniciales para visualización inmediata en dev
  if (!options.remanenteQueryRepository && remanenteQueryRepo instanceof InMemoryRemanenteQueryRepository) {
    const now = new Date();
    remanenteQueryRepo.seedRemanente({
      id: 'rem-101',
      insumoId: 'ins-1',
      insumoName: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
      currentQuantity: '1.7500',
      initialQuantity: '2.0000',
      location: 'KITCHEN_FRIDGE',
      expirationDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      status: 'ACTIVE',
      createdAt: now,
    });
    remanenteQueryRepo.seedRemanente({
      id: 'rem-102',
      insumoId: 'ins-2',
      insumoName: 'Salsa Pomodoro',
      unitOfMeasure: 'L',
      currentQuantity: '4.5000',
      initialQuantity: '5.0000',
      location: 'KITCHEN_FRIDGE',
      expirationDate: new Date(now.getTime() + 14 * 60 * 60 * 1000),
      status: 'ACTIVE',
      createdAt: now,
    });
    remanenteQueryRepo.seedRemanente({
      id: 'rem-103',
      insumoId: 'ins-3',
      insumoName: 'Masa de Pizza',
      unitOfMeasure: 'UNITS',
      currentQuantity: '12.0000',
      initialQuantity: '15.0000',
      location: 'KITCHEN_PREP',
      expirationDate: new Date(now.getTime() + 22 * 60 * 60 * 1000),
      status: 'ACTIVE',
      createdAt: now,
    });
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
