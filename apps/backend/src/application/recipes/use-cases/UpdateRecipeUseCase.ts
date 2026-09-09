import { RecipeDetailsPatch } from '../../../domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRecipePreparationRepository } from '../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { RecipeCompositionLockedException } from '../../../domain/recipes/errors/RecipeCompositionLockedException.js';

export interface UpdateRecipeIngredientDTO {
  insumoId: string;
  quantity: number | string;
}

export interface UpdateRecipeDTO {
  id: string;
  name?: string;
  category?: string;
  description?: string | null;
  ingredients?: UpdateRecipeIngredientDTO[];
}

export interface UpdateRecipeResponseDTO {
  message: string;
  recipeId: string;
}

export class UpdateRecipeUseCase {
  constructor(
    private readonly recipeRepository: IRecipeRepository,
    private readonly insumoRepository: IInsumoRepository,
    private readonly idGenerator: IdGenerator,
    private readonly preparationRepository: IRecipePreparationRepository
  ) {}

  public async execute(dto: UpdateRecipeDTO): Promise<UpdateRecipeResponseDTO> {
    const recipe = await this.recipeRepository.findById(dto.id);
    if (!recipe) {
      throw new EntityNotFoundException('Recipe', dto.id);
    }

    // `description` se pasa tal cual: `undefined` conserva la actual, `null` la limpia (ver `Recipe.withDetails`).
    const patch: RecipeDetailsPatch = {
      name: dto.name?.trim(),
      category: dto.category?.trim(),
      description: dto.description,
    };

    if (dto.ingredients !== undefined) {
      await this.assertCompositionEditable(recipe.id);
      await this.assertInsumosExist(dto.ingredients);
      patch.ingredients = this.buildIngredients(recipe.id, dto.ingredients);
    }

    await this.recipeRepository.save(recipe.withDetails(patch));
    return { message: 'Recipe updated successfully', recipeId: recipe.id };
  }

  private async assertCompositionEditable(recipeId: string): Promise<void> {
    const closed = await this.preparationRepository.findByStatus('CLOSED');
    if (closed.some((preparation) => preparation.recipeId === recipeId)) {
      throw new RecipeCompositionLockedException(recipeId);
    }
  }

  private async assertInsumosExist(ingredients: UpdateRecipeIngredientDTO[]): Promise<void> {
    const uniqueIds = [...new Set(ingredients.map((i) => i.insumoId))];
    const found = await Promise.all(uniqueIds.map((id) => this.insumoRepository.findById(id)));
    const missing = uniqueIds.find((_, index) => found[index] === null);
    if (missing) {
      throw new EntityNotFoundException('Insumo', missing);
    }
  }

  private buildIngredients(recipeId: string, ingredients: UpdateRecipeIngredientDTO[]): RecipeIngredient[] {
    return ingredients.map(
      (ingredient) =>
        new RecipeIngredient(
          this.idGenerator.next('ri'),
          recipeId,
          ingredient.insumoId,
          new DecimalQuantity(ingredient.quantity)
        )
    );
  }
}
