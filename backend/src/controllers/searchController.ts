import { Request, Response } from 'express';
import { searchService } from '../services/searchService';

export const searchController = {
  // Búsqueda por ingredientes
  searchByIngredients: async (req: Request, res: Response) => {
    try {
      const { ingredients } = req.body;
      
      if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ message: 'Se requiere un array de ingredientes' });
      }

      const recipes = await searchService.searchByIngredients(ingredients);
      res.json(recipes);
    } catch (error) {
      console.error('Error en búsqueda por ingredientes:', error);
      res.status(500).json({ message: 'Error al buscar por ingredientes' });
    }
  },

  // Búsqueda semántica
  semanticSearch: async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Se requiere un término de búsqueda' });
      }

      console.log('Realizando búsqueda semántica con query:', query);
      const recipes = await searchService.semanticSearch(query);
      console.log('Recetas encontradas:', recipes);

      res.json({
        success: true,
        data: recipes,
        message: 'Búsqueda semántica completada exitosamente'
      });
    } catch (error) {
      console.error('Error en búsqueda semántica:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error en la búsqueda semántica',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Búsqueda con filtros
  searchWithFilters: async (req: Request, res: Response) => {
    try {
      const { ingredients, dietary, cookingTime, difficulty } = req.body;

      const recipes = await searchService.searchWithFilters({
        ingredients,
        dietary,
        cookingTime,
        difficulty,
      });

      res.json(recipes);
    } catch (error) {
      console.error('Error en búsqueda con filtros:', error);
      res.status(500).json({ message: 'Error en la búsqueda con filtros' });
    }
  },

  searchByFilters: async (req: Request, res: Response) => {
    try {
      const { cookingTime, difficulty, dietaryRestrictions } = req.body;

      const result = await searchService.searchByFilters({
        cookingTime,
        difficulty,
        dietaryRestrictions
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error en la búsqueda por filtros:', error);
      res.status(500).json({
        success: false,
        data: [],
        message: 'Error al realizar la búsqueda por filtros',
        error
      });
    }
  },
}; 