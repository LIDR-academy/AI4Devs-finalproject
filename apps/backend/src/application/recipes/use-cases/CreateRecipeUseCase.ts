import crypto from 'crypto';
import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

export interface CreateRecipeIngredientDTO {
  insumoId: string;
  quantity: number | string;
}

export interface CreateRecipeDTO {
  name: string;
  category: string;
  description?: string;
  ingredients: CreateRecipeIngredientDTO[];
}

export interface CreateRecipeResponseDTO {
  message: string;
  recipeId: string;
}

export class CreateRecipeUseCase {
  constructor(
    private readonly recipeRepository: IRecipeRepository,
    private readonly insumoRepository: IInsumoRepository
  ) {}

  public async execute(dto: CreateRecipeDTO): Promise<CreateRecipeResponseDTO> {
    for (const ingredientDto of dto.ingredients) {
      const insumo = await this.insumoRepository.findById(ingredientDto.insumoId);
      if (!insumo) {
        throw new EntityNotFoundException('Insumo', ingredientDto.insumoId);
      }
    }

    const recipeId = crypto.randomUUID();
    const ingredients = dto.ingredients.map(
      (ingredientDto) =>
        new RecipeIngredient(
          crypto.randomUUID(),
          recipeId,
          ingredientDto.insumoId,
          new DecimalQuantity(ingredientDto.quantity)
        )
    );

    const recipe = new Recipe(recipeId, dto.name, dto.category, ingredients, dto.description);
    await this.recipeRepository.save(recipe);

    return { message: 'Recipe created successfully', recipeId };
  }
}
