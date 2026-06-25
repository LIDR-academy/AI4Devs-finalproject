export interface RecipeSuggestion {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  matchedIngredients: string[];
  missingIngredients: string[];
  matchScore: number;
}

export interface RecipeIngredient {
  name: string;
  measure: string;
}

export interface RecipeDetail {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  youtubeUrl: string | null;
  instructions: string;
  ingredients: RecipeIngredient[];
  matchedPantryItemIds: string[];
  matchedIngredientNames: string[];
}

export interface CookRecipeResult {
  consumedCount: number;
  events: Array<{ id: string }>;
}
