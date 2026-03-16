import { api } from './api';

export interface Recipe {
  createdBy: string;
  id: string;
  title: string;
  description: string;
  ingredients: any[];
  instructions: any[];
  cookingTime: number;
  difficulty: string;
  userId: string;
  createdAt: string;
}

export const recipeService = {
  createRecipe: async (data: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) => {
    const response = await api.post<Recipe>('/api/recipes', data);
    return response.data;
  },

  getRecipes: async () => {
    const response = await api.get<Recipe[]>('/api/recipes');
    return response.data;
  },

  getRecipe: async (id: string) => {
    const response = await api.get<Recipe>(`/api/recipes/${id}`);
    return response.data;
  },

  updateRecipe: async (id: string, data: Partial<Recipe>) => {
    const response = await api.put<Recipe>(`/api/recipes/${id}`, data);
    return response.data;
  },

  deleteRecipe: async (id: string) => {
    const response = await api.delete(`/api/recipes/${id}`);
    return response.data;
  },
}; 