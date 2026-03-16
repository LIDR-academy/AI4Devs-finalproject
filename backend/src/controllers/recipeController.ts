import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';

const prisma = new PrismaClient();

export const recipeController = {
  // Crear una nueva receta
  createRecipe: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const { 
        title, 
        description, 
        ingredients, 
        instructions, 
        cookingTime, 
        difficulty, 
        servings, 
        imageUrl,
        dietaryRestrictions 
      } = req.body;

      const recipe = await prisma.recipe.create({
        data: {
          title,
          description,
          ingredients,
          instructions,
          cookingTime,
          difficulty,
          servings,
          imageUrl,
          dietaryRestrictions,
          createdBy: userId,
        },
      });

      res.status(201).json(recipe);
    } catch (error) {
      console.error('Error al crear la receta:', error);
      res.status(500).json({ message: 'Error al crear la receta' });
    }
  },

  // Obtener todas las recetas del usuario
  getUserRecipes: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const recipes = await prisma.recipe.findMany({
        where: {
          createdBy: userId,
        },
      });

      res.json(recipes);
    } catch (error) {
      console.error('Error al obtener las recetas:', error);
      res.status(500).json({ message: 'Error al obtener las recetas' });
    }
  },

  // Obtener una receta específica
  getRecipe: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const { id } = req.params;

      const recipe = await prisma.recipe.findFirst({
        where: {
          id,
          createdBy: userId,
        },
      });

      if (!recipe) {
        return res.status(404).json({ message: 'Receta no encontrada' });
      }

      res.json(recipe);
    } catch (error) {
      console.error('Error al obtener la receta:', error);
      res.status(500).json({ message: 'Error al obtener la receta' });
    }
  },

  // Actualizar una receta
  updateRecipe: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const { id } = req.params;
      const { 
        title, 
        description, 
        ingredients, 
        instructions, 
        cookingTime, 
        difficulty, 
        servings, 
        imageUrl,
        dietaryRestrictions 
      } = req.body;

      const recipe = await prisma.recipe.update({
        where: {
          id,
          createdBy: userId,
        },
        data: {
          title,
          description,
          ingredients,
          instructions,
          cookingTime,
          difficulty,
          servings,
          imageUrl,
          dietaryRestrictions,
        },
      });

      res.json(recipe);
    } catch (error) {
      console.error('Error al actualizar la receta:', error);
      res.status(500).json({ message: 'Error al actualizar la receta' });
    }
  },

  // Eliminar una receta
  deleteRecipe: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const { id } = req.params;

      await prisma.recipe.delete({
        where: {
          id,
          createdBy: userId,
        },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar la receta:', error);
      res.status(500).json({ message: 'Error al eliminar la receta' });
    }
  },
}; 