import { apiRequest } from '../../../shared/http/apiClient.js';
import { InsumoItem } from '../../stock/services/stock.service.js';

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

export class RecipesService {
  /**
   * Llamada estricta a /stock/insumos (sin fallback silencioso a datos mock):
   * a diferencia de StockService.getInsumos() -pensado para el modo offline de
   * cocina-, dar de alta una receta contra un insumo inventado si el backend
   * falla corrompería el catálogo maestro. Ver TK-069.
   */
  public static async listInsumos(): Promise<InsumoItem[]> {
    return apiRequest<InsumoItem[]>('/stock/insumos');
  }

  public static async listRecipes(): Promise<RecipeListItem[]> {
    return apiRequest<RecipeListItem[]>('/recipes');
  }

  public static async createRecipe(data: CreateRecipeRequest): Promise<CreateRecipeResult> {
    return apiRequest<CreateRecipeResult>('/recipes', { method: 'POST', body: data });
  }
}
