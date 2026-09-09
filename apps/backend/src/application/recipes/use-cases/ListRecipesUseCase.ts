import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';

export interface RecipeIngredientListItemDTO {
  insumoId: string;
  quantity: string;
}

export interface RecipeListItemDTO {
  id: string;
  name: string;
  category: string;
  description?: string;
  ingredients: RecipeIngredientListItemDTO[];
}

export class ListRecipesUseCase {
  constructor(private readonly recipeRepository: IRecipeRepository) {}

  public async execute(): Promise<RecipeListItemDTO[]> {
    const recipes = await this.recipeRepository.findAll();

    return recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      description: recipe.description,
      ingredients: recipe.ingredients.map((ingredient) => ({
        insumoId: ingredient.insumoId,
        quantity: ingredient.quantity.toString(),
      })),
    }));
  }
}
