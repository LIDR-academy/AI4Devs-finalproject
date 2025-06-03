import { create } from 'zustand';
import { Recipe, recipeService } from '@/services/recipeService';

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  getRecipe: (id: string) => Promise<Recipe>;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  loading: false,
  error: null,

  fetchRecipes: async () => {
    set({ loading: true, error: null });
    try {
      const recipes = await recipeService.getRecipes();
      set({ recipes, loading: false });
    } catch (error) {
      set({ error: 'Error al cargar las recetas', loading: false });
    }
  },

  getRecipe: async (id: string) => {
    try {
      const recipe = await recipeService.getRecipe(id);
      return recipe;
    } catch (error) {
      throw new Error('Error al cargar la receta');
    }
  },

  addRecipe: async (recipe) => {
    set({ loading: true, error: null });
    try {
      const newRecipe = await recipeService.createRecipe(recipe);
      set(state => ({ recipes: [...state.recipes, newRecipe], loading: false }));
    } catch (error) {
      set({ error: 'Error al crear la receta', loading: false });
    }
  },

  updateRecipe: async (id, recipe) => {
    set({ loading: true, error: null });
    try {
      const updatedRecipe = await recipeService.updateRecipe(id, recipe);
      set(state => ({
        recipes: state.recipes.map(r => r.id === id ? updatedRecipe : r),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Error al actualizar la receta', loading: false });
    }
  },

  deleteRecipe: async (id) => {
    set({ loading: true, error: null });
    try {
      await recipeService.deleteRecipe(id);
      set(state => ({
        recipes: state.recipes.filter(r => r.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Error al eliminar la receta', loading: false });
    }
  }
})); 