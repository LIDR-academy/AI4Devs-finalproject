import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';

export class InMemoryRecipeRepository implements IRecipeRepository {
  private recipes: Map<string, Recipe> = new Map();

  // US-037: los métodos de lectura devuelven solo recetas activas (isActive === true).
  async findById(id: string): Promise<Recipe | null> {
    const recipe = this.recipes.get(id);
    return recipe && recipe.isActive ? recipe : null;
  }

  async findAll(): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter((r) => r.isActive);
  }

  async findByInsumoIds(insumoIds: string[]): Promise<Recipe[]> {
    if (insumoIds.length === 0) {
      return [];
    }
    const wanted = new Set(insumoIds);
    return Array.from(this.recipes.values()).filter(
      (recipe) => recipe.isActive && recipe.ingredients.some((ingredient) => wanted.has(ingredient.insumoId))
    );
  }

  async save(recipe: Recipe): Promise<void> {
    this.recipes.set(recipe.id, recipe);
  }
}
