import { RecipeIngredient } from './RecipeIngredient.js';

export class Recipe {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly category: string,
    public readonly ingredients: RecipeIngredient[],
    public readonly description?: string
  ) {}
}
