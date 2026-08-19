import { IUserRepository } from '../../domain/auth/repositories/IUserRepository.js';
import { IStockRepository } from '../../domain/stock/repositories/IStockRepository.js';
import {
  IRemanenteQueryRepository,
  ActiveRemanenteDTO,
} from '../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IRecipeRepository } from '../../domain/catalog/repositories/IRecipeRepository.js';
import { User } from '../../domain/auth/entities/User.js';
import { Pin } from '../../domain/auth/value-objects/Pin.js';
import { Insumo } from '../../domain/stock/entities/Insumo.js';
import { Recipe } from '../../domain/catalog/entities/Recipe.js';
import { RecipeIngredient } from '../../domain/catalog/entities/RecipeIngredient.js';
import { Remanente } from '../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../domain/stock/value-objects/DecimalQuantity.js';

export interface SeedRepositories {
  userRepo: IUserRepository;
  stockRepo: IStockRepository;
  remanenteQueryRepo: IRemanenteQueryRepository;
  recipeRepo: IRecipeRepository;
}

export interface SeedOptions {
  includeSyntheticFixtures?: boolean;
}

/**
 * Módulo de Seeding Desacoplado e Idempotente de RestoStock.
 * Implementa los 5 Pilares del Seeding Profesional:
 * 1. Separación de Entornos (Essential vs Synthetic Fixtures).
 * 2. Idempotencia (Upsert / Chequeo de existencia previa).
 * 3. Desacoplamiento de Runtime (Runner invocable vía CLI / Standalone).
 * 4. Aislamiento en Tests (Opcional bajo demanda).
 * 5. Gobernanza PII (Identificadores sintéticos y hash seguro).
 */
export async function runSeed(repos: SeedRepositories, options: SeedOptions = {}): Promise<void> {
  const includeFixtures = options.includeSyntheticFixtures ?? process.env.NODE_ENV !== 'production';
  const kitchenPin = process.env.SEED_KITCHEN_PIN ?? '1234';
  const adminPin = process.env.SEED_ADMIN_PIN ?? '1234';

  // 1. 🌱 ESSENTIAL SEEDS (Catálogo y Usuarios Estructurales del Sistema)
  const existingCarlos = await repos.userRepo.findById('usr-carlos-1');
  if (!existingCarlos) {
    await repos.userRepo.save(
      new User({
        id: 'usr-carlos-1',
        name: 'Carlos Gomez (Cocina)',
        role: 'KITCHEN_STAFF',
        pin: Pin.createFromRaw(kitchenPin),
        status: 'ACTIVE',
        failedAttempts: 0,
      })
    );
  }

  const existingMaria = await repos.userRepo.findById('usr-maria-2');
  if (!existingMaria) {
    await repos.userRepo.save(
      new User({
        id: 'usr-maria-2',
        name: 'Maria Silva (Administrador)',
        role: 'ADMIN',
        pin: Pin.createFromRaw(adminPin),
        status: 'ACTIVE',
        failedAttempts: 0,
      })
    );
  }

  // 2. 🧪 SYNTHETIC FIXTURES SEEDS (Solo en Entornos Dev / Staging / Standalone)
  if (includeFixtures) {
    // Insumos de Bodega Ficticios
    const existingIns1 = await repos.stockRepo.findInsumoById('ins-1');
    if (!existingIns1) {
      await repos.stockRepo.saveInsumo(
        new Insumo({
          id: 'ins-1',
          name: 'Queso Mozzarella',
          unitOfMeasure: 'KG',
          warehouseStock: new DecimalQuantity('50.0000'),
        })
      );
    }

    const existingIns2 = await repos.stockRepo.findInsumoById('ins-2');
    if (!existingIns2) {
      await repos.stockRepo.saveInsumo(
        new Insumo({
          id: 'ins-2',
          name: 'Salsa Pomodoro',
          unitOfMeasure: 'L',
          warehouseStock: new DecimalQuantity('50.0000'),
        })
      );
    }

    const existingIns3 = await repos.stockRepo.findInsumoById('ins-3');
    if (!existingIns3) {
      await repos.stockRepo.saveInsumo(
        new Insumo({
          id: 'ins-3',
          name: 'Masa de Pizza',
          unitOfMeasure: 'UNITS',
          warehouseStock: new DecimalQuantity('100.0000'),
        })
      );
    }

    // Recetas Sintéticas
    const existingRecipe = await repos.recipeRepo.findById('rec-pizza-margarita');
    if (!existingRecipe) {
      const pizzaRecipe = new Recipe(
        'rec-pizza-margarita',
        'Pizza Margarita',
        'PIZZA',
        [
          new RecipeIngredient('ing-1', 'rec-pizza-margarita', 'ins-1', new DecimalQuantity('0.1500')),
          new RecipeIngredient('ing-2', 'rec-pizza-margarita', 'ins-2', new DecimalQuantity('0.1000')),
          new RecipeIngredient('ing-3', 'rec-pizza-margarita', 'ins-3', new DecimalQuantity('1.0000')),
        ],
        'Pizza clásica con salsa pomodoro, queso mozzarella y albahaca'
      );
      await repos.recipeRepo.save(pizzaRecipe);
    }

    const existingRec1 = await repos.recipeRepo.findById('rec-1');
    if (!existingRec1) {
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
      await repos.recipeRepo.save(pizzaRec1);
    }

    // Remanentes Activos FEFO Simulados (Persistidos en Repositorio de Stock y Query Model)
    const queryRepoWithSeed = repos.remanenteQueryRepo as {
      seedRemanente?: (item: ActiveRemanenteDTO) => void;
      findActiveRemanentes: () => Promise<ActiveRemanenteDTO[]>;
    };
    if (typeof queryRepoWithSeed.seedRemanente === 'function') {
      const activeRemanentes = await repos.remanenteQueryRepo.findActiveRemanentes();
      if (activeRemanentes.length === 0) {
        const now = new Date();
        const exp1 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const exp2 = new Date(now.getTime() + 14 * 60 * 60 * 1000);
        const exp3 = new Date(now.getTime() + 22 * 60 * 60 * 1000);

        // 1. Guardar Entidades en StockRepository (Write Model)
        await repos.stockRepo.saveRemanente(
          new Remanente({
            id: 'rem-101',
            insumoId: 'ins-1',
            currentQuantity: new DecimalQuantity('1.7500'),
            initialQuantity: new DecimalQuantity('2.0000'),
            location: 'KITCHEN_FRIDGE',
            status: 'ACTIVE',
            expirationDate: exp1,
            createdAt: now,
          })
        );

        await repos.stockRepo.saveRemanente(
          new Remanente({
            id: 'rem-102',
            insumoId: 'ins-2',
            currentQuantity: new DecimalQuantity('4.5000'),
            initialQuantity: new DecimalQuantity('5.0000'),
            location: 'KITCHEN_FRIDGE',
            status: 'ACTIVE',
            expirationDate: exp2,
            createdAt: now,
          })
        );

        await repos.stockRepo.saveRemanente(
          new Remanente({
            id: 'rem-103',
            insumoId: 'ins-3',
            currentQuantity: new DecimalQuantity('12.0000'),
            initialQuantity: new DecimalQuantity('15.0000'),
            location: 'KITCHEN_PREP',
            status: 'ACTIVE',
            expirationDate: exp3,
            createdAt: now,
          })
        );

        // 2. Sembrar en Query Model
        const seedRem = queryRepoWithSeed.seedRemanente!.bind(repos.remanenteQueryRepo);
        seedRem({
          id: 'rem-101',
          insumoId: 'ins-1',
          insumoName: 'Queso Mozzarella',
          unitOfMeasure: 'KG',
          currentQuantity: '1.7500',
          initialQuantity: '2.0000',
          location: 'KITCHEN_FRIDGE',
          expirationDate: exp1,
          status: 'ACTIVE',
          createdAt: now,
        });

        seedRem({
          id: 'rem-102',
          insumoId: 'ins-2',
          insumoName: 'Salsa Pomodoro',
          unitOfMeasure: 'L',
          currentQuantity: '4.5000',
          initialQuantity: '5.0000',
          location: 'KITCHEN_FRIDGE',
          expirationDate: exp2,
          status: 'ACTIVE',
          createdAt: now,
        });

        seedRem({
          id: 'rem-103',
          insumoId: 'ins-3',
          insumoName: 'Masa de Pizza',
          unitOfMeasure: 'UNITS',
          currentQuantity: '12.0000',
          initialQuantity: '15.0000',
          location: 'KITCHEN_PREP',
          expirationDate: exp3,
          status: 'ACTIVE',
          createdAt: now,
        });
      }
    }
  }
}
