import { Recipe } from '../entities/Recipe.js';

export interface IRecipeRepository {
  findById(id: string): Promise<Recipe | null>;
  findAll(): Promise<Recipe[]>;
  /**
   * Recetas que usan al menos uno de los insumos indicados (AUDIT-DEV-007 F-7).
   * Evita traer todo el catálogo para el ranking de recetas de rescate. Con lista
   * vacía devuelve `[]` sin consultar.
   */
  findByInsumoIds(insumoIds: string[]): Promise<Recipe[]>;
  save(recipe: Recipe): Promise<void>;
}
