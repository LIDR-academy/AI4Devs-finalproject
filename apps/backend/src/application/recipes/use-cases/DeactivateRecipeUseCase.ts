import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

/**
 * US-037 Escenario 4: baja lógica de una receta (`isActive = false`). El borrado físico
 * no es posible — `RecipePreparation.recipe` es `onDelete: Restrict`. Las preparaciones
 * históricas se conservan intactas; la receta desaparece del recetario, del rescate y
 * de la disponibilidad.
 */
export class DeactivateRecipeUseCase {
  constructor(private readonly recipeRepository: IRecipeRepository) {}

  public async execute(id: string): Promise<void> {
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      throw new EntityNotFoundException('Recipe', id);
    }
    await this.recipeRepository.save(recipe.deactivated());
  }
}
