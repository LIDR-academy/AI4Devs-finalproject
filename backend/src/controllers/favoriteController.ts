import { Request, Response } from 'express';
import { FavoriteService } from '../services/favoriteService';
import { IUser } from '../types';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export class FavoriteController {
  // Obtener todos los favoritos del usuario autenticado
  static async getUserFavorites(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id_user;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { page = 1, limit = 10 } = req.query;
      const favorites = await FavoriteService.getUserFavorites(
        userId,
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: favorites.favorites,
        pagination: favorites.pagination
      });
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Agregar propiedad a favoritos
  static async addToFavorites(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id_user;
      const { propertyId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          message: 'ID de propiedad requerido'
        });
      }

      const favorite = await FavoriteService.addToFavorites(userId, propertyId);

      res.status(201).json({
        success: true,
        data: favorite,
        message: 'Propiedad agregada a favoritos'
      });
    } catch (error: any) {
      console.error('Error al agregar a favoritos:', error);
      
      if (error.message === 'PROPERTY_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
      }
      
      if (error.message === 'ALREADY_IN_FAVORITES') {
        return res.status(409).json({
          success: false,
          message: 'La propiedad ya está en tus favoritos'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Remover propiedad de favoritos
  static async removeFromFavorites(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id_user;
      const { propertyId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          message: 'ID de propiedad requerido'
        });
      }

      await FavoriteService.removeFromFavorites(userId, propertyId);

      res.json({
        success: true,
        message: 'Propiedad removida de favoritos'
      });
    } catch (error: any) {
      console.error('Error al remover de favoritos:', error);
      
      if (error.message === 'FAVORITE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'La propiedad no está en tus favoritos'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar si una propiedad está en favoritos
  static async checkFavoriteStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id_user;
      const { propertyId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          message: 'ID de propiedad requerido'
        });
      }

      const isFavorite = await FavoriteService.isPropertyFavorite(userId, propertyId);

      res.json({
        success: true,
        data: { isFavorite }
      });
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de favoritos del usuario
  static async getFavoriteStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id_user;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const stats = await FavoriteService.getFavoriteStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de favoritos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
