import { Recipe } from '../entities/Recipe.js';

export interface IRecipeRepository {
  findById(id: string): Promise<Recipe | null>;
  findAll(): Promise<Recipe[]>;
  save(recipe: Recipe): Promise<void>;
}
