import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';

export class InMemoryRecipeRepository implements IRecipeRepository {
  private recipes: Map<string, Recipe> = new Map();

  async findById(id: string): Promise<Recipe | null> {
    return this.recipes.get(id) || null;
  }

  async findAll(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async save(recipe: Recipe): Promise<void> {
    this.recipes.set(recipe.id, recipe);
  }
}
