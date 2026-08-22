import { IUserRepository } from '../../domain/auth/repositories/IUserRepository.js';
import { IInsumoRepository } from '../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteRepository } from '../../domain/stock/repositories/IRemanenteRepository.js';
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
  stockRepo: IInsumoRepository & IRemanenteRepository;
  remanenteQueryRepo: IRemanenteQueryRepository;
  recipeRepo: IRecipeRepository;
}

export interface SeedOptions {
  includeSyntheticFixtures?: boolean;
}

// 1. 🌱 ESSENTIAL SEEDS (Catálogo y Usuarios Estructurales del Sistema)
async function seedEssentialUsers(userRepo: IUserRepository): Promise<void> {
  const kitchenPin = process.env.SEED_KITCHEN_PIN ?? '1234';
  const adminPin = process.env.SEED_ADMIN_PIN ?? '1234';

  const existingCarlos = await userRepo.findById('usr-carlos-1');
  if (!existingCarlos) {
    await userRepo.save(
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

  const existingMaria = await userRepo.findById('usr-maria-2');
  if (!existingMaria) {
    await userRepo.save(
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
}

// Insumos de Bodega Ficticios (solo entornos dev/staging/standalone)
async function seedSyntheticInsumos(insumoRepo: IInsumoRepository): Promise<void> {
  const existingIns1 = await insumoRepo.findById('ins-1');
  if (!existingIns1) {
    await insumoRepo.save(
      new Insumo({ id: 'ins-1', name: 'Queso Mozzarella', unitOfMeasure: 'KG', warehouseStock: new DecimalQuantity('50.0000') })
    );
  }

  const existingIns2 = await insumoRepo.findById('ins-2');
  if (!existingIns2) {
    await insumoRepo.save(
      new Insumo({ id: 'ins-2', name: 'Salsa Pomodoro', unitOfMeasure: 'L', warehouseStock: new DecimalQuantity('50.0000') })
    );
  }

  const existingIns3 = await insumoRepo.findById('ins-3');
  if (!existingIns3) {
    await insumoRepo.save(
      new Insumo({ id: 'ins-3', name: 'Masa de Pizza', unitOfMeasure: 'UNITS', warehouseStock: new DecimalQuantity('100.0000') })
    );
  }
}

// Recetas Sintéticas (solo entornos dev/staging/standalone)
async function seedSyntheticRecipes(recipeRepo: IRecipeRepository): Promise<void> {
  const existingRecipe = await recipeRepo.findById('rec-pizza-margarita');
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
    await recipeRepo.save(pizzaRecipe);
  }

  const existingRec1 = await recipeRepo.findById('rec-1');
  if (!existingRec1) {
    const pizzaRec1 = new Recipe('rec-1', 'Pizza Margarita', 'PIZZA', [
      new RecipeIngredient('ing-1', 'rec-1', 'ins-1', new DecimalQuantity('0.1500')),
      new RecipeIngredient('ing-2', 'rec-1', 'ins-2', new DecimalQuantity('0.1000')),
      new RecipeIngredient('ing-3', 'rec-1', 'ins-3', new DecimalQuantity('1.0000')),
    ]);
    await recipeRepo.save(pizzaRec1);
  }
}

// Remanentes Activos FEFO Simulados (Persistidos en Repositorio de Stock y Query Model)
async function seedSyntheticRemanentes(
  remanenteRepo: IRemanenteRepository,
  remanenteQueryRepo: IRemanenteQueryRepository
): Promise<void> {
  const queryRepoWithSeed = remanenteQueryRepo as {
    seedRemanente?: (item: ActiveRemanenteDTO) => void;
    findActiveRemanentes: () => Promise<ActiveRemanenteDTO[]>;
  };
  if (typeof queryRepoWithSeed.seedRemanente !== 'function') {
    return;
  }

  const activeRemanentes = await remanenteQueryRepo.findActiveRemanentes();
  if (activeRemanentes.length > 0) {
    return;
  }

  const now = new Date();
  const fixtures = [
    { id: 'rem-101', insumoId: 'ins-1', insumoName: 'Queso Mozzarella', unitOfMeasure: 'KG', currentQuantity: '1.7500', initialQuantity: '2.0000', location: 'KITCHEN_FRIDGE', hoursToExpire: 2 },
    { id: 'rem-102', insumoId: 'ins-2', insumoName: 'Salsa Pomodoro', unitOfMeasure: 'L', currentQuantity: '4.5000', initialQuantity: '5.0000', location: 'KITCHEN_FRIDGE', hoursToExpire: 14 },
    { id: 'rem-103', insumoId: 'ins-3', insumoName: 'Masa de Pizza', unitOfMeasure: 'UNITS', currentQuantity: '12.0000', initialQuantity: '15.0000', location: 'KITCHEN_PREP', hoursToExpire: 22 },
  ];

  const seedRem = queryRepoWithSeed.seedRemanente!.bind(remanenteQueryRepo);
  for (const fixture of fixtures) {
    const expirationDate = new Date(now.getTime() + fixture.hoursToExpire * 60 * 60 * 1000);

    // 1. Guardar Entidad en RemanenteRepository (Write Model)
    await remanenteRepo.saveRemanente(
      new Remanente({
        id: fixture.id,
        insumoId: fixture.insumoId,
        currentQuantity: new DecimalQuantity(fixture.currentQuantity),
        initialQuantity: new DecimalQuantity(fixture.initialQuantity),
        location: fixture.location,
        status: 'ACTIVE',
        expirationDate,
        createdAt: now,
      })
    );

    // 2. Sembrar en Query Model (Read Model)
    seedRem({
      id: fixture.id,
      insumoId: fixture.insumoId,
      insumoName: fixture.insumoName,
      unitOfMeasure: fixture.unitOfMeasure,
      currentQuantity: fixture.currentQuantity,
      initialQuantity: fixture.initialQuantity,
      location: fixture.location,
      expirationDate,
      status: 'ACTIVE',
      createdAt: now,
    });
  }
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

  await seedEssentialUsers(repos.userRepo);

  if (includeFixtures) {
    await seedSyntheticInsumos(repos.stockRepo);
    await seedSyntheticRecipes(repos.recipeRepo);
    await seedSyntheticRemanentes(repos.stockRepo, repos.remanenteQueryRepo);
  }
}
