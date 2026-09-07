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

export interface RescueIngredientItem {
  insumoId: string;
  insumoName: string;
  quantity: string;
  unit: string;
  isAtRisk: boolean;
}

export interface RescueRecipeProposal {
  name: string;
  description: string;
  category: string;
  estimatedPortions: number;
  ingredients: RescueIngredientItem[];
  preventedWasteEstimate: string;
}

export interface RescueSuggestionsResponse {
  source: 'CATALOG' | 'GEMINI' | 'OPENAI_COMPATIBLE' | 'HEURISTIC';
  proposals: RescueRecipeProposal[];
}

export class RecipesService {
  /**
   * Llamada estricta a /stock/insumos. Dar de alta una receta contra un insumo
   * inventado si el backend falla corrompería el catálogo maestro. Ver TK-069.
   * (Desde AUDIT-DEV-006 F-5, `StockService.getInsumos()` también propaga sus
   * errores en vez de caer a datos mock — esta duplicación ya no aporta nada
   * distinto y podría unificarse en un ticket futuro.)
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

  public static async suggestRescueRecipes(mode: 'CATALOG' | 'CREATIVE' = 'CATALOG'): Promise<RescueSuggestionsResponse> {
    return apiRequest<RescueSuggestionsResponse>('/recipes/rescue-suggestions', {
      method: 'POST',
      body: { mode },
    });
  }
}

