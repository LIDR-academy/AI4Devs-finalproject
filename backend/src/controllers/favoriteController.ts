import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';

const prisma = new PrismaClient();

export const favoriteController = {
  // Obtener todos los favoritos del usuario
  getFavorites: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const favorites = await prisma.favorite.findMany({
        where: {
          userId: userId,
        },
        include: {
          recipe: true,
        },
      });

      res.json(favorites);
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      res.status(500).json({ message: 'Error al obtener favoritos' });
    }
  },

  // Agregar una receta a favoritos
  addFavorite: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const recipeId = req.params.recipeId;
      if (!recipeId) {
        return res.status(400).json({ message: 'ID de receta requerido' });
      }

      // Verificar si la receta existe
      let recipe = await prisma.recipe.findUnique({
        where: { id: recipeId }
      });

      // Si la receta no existe y tenemos los datos de la IA en el cuerpo de la petición
      if (!recipe && req.body.recipe) {
        const aiRecipe = req.body.recipe;
        
        // Guardar la receta en la base de datos
        recipe = await prisma.recipe.create({
          data: {
            id: recipeId,
            title: aiRecipe.title,
            description: aiRecipe.description,
            ingredients: aiRecipe.ingredients,
            instructions: aiRecipe.instructions,
            cookingTime: aiRecipe.cookingTime,
            difficulty: aiRecipe.difficulty,
            servings: aiRecipe.servings || 1,
            imageUrl: aiRecipe.imageUrl,
            dietaryRestrictions: aiRecipe.dietaryRestrictions,
            createdBy: userId
          }
        });
      } else if (!recipe) {
        return res.status(404).json({ message: 'Receta no encontrada' });
      }

      // Verificar si ya existe como favorito
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId
          }
        }
      });

      if (existingFavorite) {
        return res.status(400).json({ message: 'La receta ya está en favoritos' });
      }

      const favorite = await prisma.favorite.create({
        data: {
          user: {
            connect: { id: userId }
          },
          recipe: {
            connect: { id: recipeId }
          }
        },
        include: {
          recipe: true
        }
      });

      res.status(201).json(favorite);
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      res.status(500).json({ message: 'Error al agregar favorito' });
    }
  },

  // Eliminar una receta de favoritos
  removeFavorite: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const { recipeId } = req.params;

      await prisma.favorite.delete({
        where: {
          userId_recipeId: {
            userId: userId,
            recipeId: recipeId,
          },
        },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      res.status(500).json({ message: 'Error al eliminar favorito' });
    }
  },

  // Verificar si una receta está en favoritos
  checkFavorite: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const { recipeId } = req.params;

      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_recipeId: {
            userId: userId,
            recipeId: recipeId,
          },
        },
      });

      res.json({ isFavorite: !!favorite });
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      res.status(500).json({ message: 'Error al verificar favorito' });
    }
  },
}; 