import { apiRequest } from '../../../shared/http/apiClient.js';

export interface RecipePreparationSummary {
  id: string;
  recipeId: string;
  plannedPortions: number;
  actualPortions: number | null;
  status: 'OPEN' | 'CLOSED' | 'ABANDONED';
  openedByOperatorId: string | null;
  openedAt: string;
  closedByOperatorId: string | null;
  closedAt: string | null;
  notes: string | null;
}

export interface RecipePreparationLinkedRemanente {
  id: string;
  insumoId: string;
  insumoName: string;
  currentQuantity: string;
  initialQuantity: string;
  storageLocationId: string | null;
  storageLocationName: string;
  /** US-028: `true` mientras no se haya consumido nada — habilita "devolver a bodega". */
  isPristine: boolean;
  status: string;
}

export interface RecipePreparationDetail extends RecipePreparationSummary {
  remanentes: RecipePreparationLinkedRemanente[];
}

export interface CloseItemInput {
  insumoId: string;
  leftoverQty: string;
  leftoverLocationId?: string;
  markedUnopened?: boolean;
  wastedQty: string;
  wasteReason?: string;
}

export interface CloseRecipePreparationRequest {
  actualPortions: number;
  items: CloseItemInput[];
}

interface CloseRecipePreparationItemResult {
  insumoId: string;
  extractedQty: string;
  consumedQty: string;
  leftoverQty: string;
  leftoverLocationId: string | null;
  wastedQty: string;
  wasteReason: string | null;
}

export interface CloseRecipePreparationResult {
  id: string;
  recipeId: string;
  status: 'CLOSED';
  actualPortions: number;
  closedByOperatorId: string | null;
  closedAt: string;
  items: CloseRecipePreparationItemResult[];
}

export interface AbandonRecipePreparationResult {
  id: string;
  status: 'ABANDONED';
  unlinkedRemanentes: number;
  closedAt: string;
}

export const RecipePreparationsService = {
  async list(status: 'OPEN' | 'CLOSED' | 'ABANDONED' = 'OPEN'): Promise<RecipePreparationSummary[]> {
    return apiRequest<RecipePreparationSummary[]>(`/kitchen/recipe-preparations?status=${status}`);
  },

  async detail(id: string): Promise<RecipePreparationDetail> {
    return apiRequest<RecipePreparationDetail>(`/kitchen/recipe-preparations/${id}`);
  },

  // US-028: sin fallback de éxito sintético — un 400/404/409/422 propaga el ApiError
  // tal cual para que el modal lo traduzca con mapToUserFriendlyError (C-DEV-006-3).
  async close(id: string, payload: CloseRecipePreparationRequest): Promise<CloseRecipePreparationResult> {
    return apiRequest<CloseRecipePreparationResult>(`/kitchen/recipe-preparations/${id}/close`, {
      method: 'POST',
      body: payload,
    });
  },

  async abandon(id: string): Promise<AbandonRecipePreparationResult> {
    return apiRequest<AbandonRecipePreparationResult>(`/kitchen/recipe-preparations/${id}/abandon`, {
      method: 'POST',
      body: {},
    });
  },
};
