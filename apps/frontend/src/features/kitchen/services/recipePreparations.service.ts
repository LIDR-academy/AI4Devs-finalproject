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

interface RecipePreparationLinkedRemanente {
  id: string;
  insumoId: string;
  insumoName: string;
  currentQuantity: string;
  initialQuantity: string;
  storageLocationName: string;
  status: string;
}

export interface RecipePreparationDetail extends RecipePreparationSummary {
  remanentes: RecipePreparationLinkedRemanente[];
}

export const RecipePreparationsService = {
  async list(status: 'OPEN' | 'CLOSED' | 'ABANDONED' = 'OPEN'): Promise<RecipePreparationSummary[]> {
    return apiRequest<RecipePreparationSummary[]>(`/kitchen/recipe-preparations?status=${status}`);
  },

  async detail(id: string): Promise<RecipePreparationDetail> {
    return apiRequest<RecipePreparationDetail>(`/kitchen/recipe-preparations/${id}`);
  },
};
