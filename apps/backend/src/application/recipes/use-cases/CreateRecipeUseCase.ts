import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';
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
    private readonly insumoRepository: IInsumoRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  public async execute(dto: CreateRecipeDTO): Promise<CreateRecipeResponseDTO> {
    await this.assertInsumosExist(dto.ingredients);

    const recipeId = this.idGenerator.next('rec');
    const ingredients = dto.ingredients.map(
      (ingredientDto) =>
        new RecipeIngredient(
          this.idGenerator.next('ri'),
          recipeId,
          ingredientDto.insumoId,
          new DecimalQuantity(ingredientDto.quantity)
        )
    );

    const recipe = new Recipe(recipeId, dto.name, dto.category, ingredients, dto.description);
    await this.recipeRepository.save(recipe);

    return { message: 'Recipe created successfully', recipeId };
  }

  private async assertInsumosExist(ingredients: CreateRecipeIngredientDTO[]): Promise<void> {
    const uniqueInsumoIds = [...new Set(ingredients.map((i) => i.insumoId))];
    const found = await Promise.all(uniqueInsumoIds.map((id) => this.insumoRepository.findById(id)));

    const missing = uniqueInsumoIds.find((_, index) => found[index] === null);
    if (missing) {
      throw new EntityNotFoundException('Insumo', missing);
    }
  }
}
