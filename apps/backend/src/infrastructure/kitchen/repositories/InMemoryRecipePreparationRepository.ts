import { IRecipePreparationRepository } from '../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { RecipePreparation, RecipePreparationStatus } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { InMemoryStockRepository } from '../../stock/repositories/InMemoryStockRepository.js';

/**
 * US-027: fake que comparte el `Map` de preparaciones con `InMemoryStockRepository`
 * (donde `RecordExtractionUseCase` las escribe vía la unit of work), igual que
 * `InMemoryRemanenteQueryRepository` comparte el de remanentes.
 */
export class InMemoryRecipePreparationRepository implements IRecipePreparationRepository {
  private readonly own = new Map<string, RecipePreparation>();

  constructor(private readonly stockRepo?: InMemoryStockRepository) {}

  private store(): Map<string, RecipePreparation> {
    return this.stockRepo ? this.stockRepo.recipePreparations : this.own;
  }

  async save(preparation: RecipePreparation): Promise<void> {
    this.store().set(preparation.id, preparation);
  }

  async findById(id: string): Promise<RecipePreparation | null> {
    return this.store().get(id) ?? null;
  }

  async findByStatus(status: RecipePreparationStatus): Promise<RecipePreparation[]> {
    return Array.from(this.store().values())
      .filter((p) => p.status === status)
      .sort((a, b) => a.openedAt.getTime() - b.openedAt.getTime());
  }
}
