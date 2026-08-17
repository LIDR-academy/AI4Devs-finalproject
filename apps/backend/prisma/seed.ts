import { runSeed } from '../src/infrastructure/seeds/seed.js';
import { InMemoryUserRepository } from '../src/infrastructure/auth/repositories/InMemoryUserRepository.js';
import { InMemoryStockRepository } from '../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryRemanenteQueryRepository } from '../src/infrastructure/kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { InMemoryRecipeRepository } from '../src/infrastructure/catalog/repositories/InMemoryRecipeRepository.js';

async function main() {
  console.log('🌱 Ejecutando Seeding Profesional de RestoStock...');
  
  const userRepo = new InMemoryUserRepository();
  const stockRepo = new InMemoryStockRepository();
  const remanenteQueryRepo = new InMemoryRemanenteQueryRepository();
  const recipeRepo = new InMemoryRecipeRepository();

  await runSeed(
    { userRepo, stockRepo, remanenteQueryRepo, recipeRepo },
    { includeSyntheticFixtures: process.env.NODE_ENV !== 'production' }
  );

  console.log('✅ Seeding ejecutado correctamente de forma idempotente.');
}

main().catch((err) => {
  console.error('🚨 Error ejecutando el sembrado de datos:', err);
  process.exit(1);
});
