export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  difficulty: string;
  imageUrl?: string;
  servings?: number;
  createdBy?: string;
  updatedAt?: string;
  dietaryRestrictions?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    nutFree?: boolean;
    other?: string[];
  };
} 