import { apiRequest } from '../../../shared/http/apiClient.js';

export type UnitOfMeasure = 'KG' | 'L' | 'UNITS';

export interface CreateInsumoRequest {
  name: string;
  unitOfMeasure: UnitOfMeasure;
}

export interface InsumoListItem {
  id: string;
  name: string;
  unitOfMeasure: UnitOfMeasure;
  warehouseStock: string;
}

export interface CreateRecipeIngredientInput {
  insumoId: string;
  quantity: string;
}

export interface CreateRecipeRequest {
  name: string;
  category: string;
  description?: string;
  ingredients: CreateRecipeIngredientInput[];
}

export interface CreateRecipeResult {
  message: string;
  recipeId: string;
}

export interface RecipeListItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  ingredients: CreateRecipeIngredientInput[];
}

export class CatalogService {
  public static async listInsumos(): Promise<InsumoListItem[]> {
    return apiRequest<InsumoListItem[]>('/stock/insumos');
  }

  public static async createInsumo(data: CreateInsumoRequest): Promise<InsumoListItem> {
    return apiRequest<InsumoListItem>('/stock/insumos', { method: 'POST', body: data });
  }

  public static async listRecipes(): Promise<RecipeListItem[]> {
    return apiRequest<RecipeListItem[]>('/catalog/recipes');
  }

  public static async createRecipe(data: CreateRecipeRequest): Promise<CreateRecipeResult> {
    return apiRequest<CreateRecipeResult>('/catalog/recipes', { method: 'POST', body: data });
  }
}
