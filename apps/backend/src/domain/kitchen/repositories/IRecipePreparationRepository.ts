import { RecipePreparation, RecipePreparationStatus } from '../entities/RecipePreparation.js';

export interface IRecipePreparationRepository {
  save(preparation: RecipePreparation): Promise<void>;
  findById(id: string): Promise<RecipePreparation | null>;
  findByStatus(status: RecipePreparationStatus): Promise<RecipePreparation[]>;
}
