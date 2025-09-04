import { Favorite, Property, User } from '../models';
import { Op } from 'sequelize';

export class FavoriteService {
  // Obtener favoritos del usuario con paginación
  static async getUserFavorites(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const { count, rows: favorites } = await Favorite.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Property,
          as: 'favoriteProperty',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id_user', 'first_name', 'last_name', 'email', 'phone']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    return {
      favorites,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  // Agregar propiedad a favoritos
  static async addToFavorites(userId: string, propertyId: string) {
    // Verificar que la propiedad existe
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('PROPERTY_NOT_FOUND');
    }

    // Verificar que no esté ya en favoritos
    const existingFavorite = await Favorite.findOne({
      where: {
        user_id: userId,
        property_id: propertyId
      }
    });

    if (existingFavorite) {
      throw new Error('ALREADY_IN_FAVORITES');
    }

    // Crear el favorito
    const favorite = await Favorite.create({
      user_id: userId,
      property_id: propertyId
    });

    // Obtener el favorito con la propiedad incluida
    const favoriteWithProperty = await Favorite.findByPk(favorite.id_favorite, {
      include: [
        {
          model: Property,
          as: 'favoriteProperty',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id_user', 'first_name', 'last_name', 'email', 'phone']
            }
          ]
        }
      ]
    });

    return favoriteWithProperty;
  }

  // Remover propiedad de favoritos
  static async removeFromFavorites(userId: string, propertyId: string) {
    const favorite = await Favorite.findOne({
      where: {
        user_id: userId,
        property_id: propertyId
      }
    });

    if (!favorite) {
      throw new Error('FAVORITE_NOT_FOUND');
    }

    await favorite.destroy();
    return true;
  }

  // Verificar si una propiedad está en favoritos
  static async isPropertyFavorite(userId: string, propertyId: string): Promise<boolean> {
    const favorite = await Favorite.findOne({
      where: {
        user_id: userId,
        property_id: propertyId
      }
    });

    return !!favorite;
  }

  // Obtener estadísticas de favoritos del usuario
  static async getFavoriteStats(userId: string) {
    const totalFavorites = await Favorite.count({
      where: { user_id: userId }
    });

    // Favoritos por tipo de operación
    const favoritesByOperation = await Favorite.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Property,
          as: 'favoriteProperty',
          attributes: ['operation_type']
        }
      ]
    });

    const saleFavorites = favoritesByOperation.filter(
      (fav: any) => fav.favoriteProperty?.operation_type === 'sale'
    ).length;

    const rentFavorites = favoritesByOperation.filter(
      (fav: any) => fav.favoriteProperty?.operation_type === 'rent'
    ).length;

    // Favoritos por tipo de propiedad
    const favoritesByType = await Favorite.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Property,
          as: 'favoriteProperty',
          attributes: ['property_type']
        }
      ]
    });

    const typeStats = favoritesByType.reduce((acc: any, fav: any) => {
      const type = fav.favoriteProperty?.property_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Favoritos recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFavorites = await Favorite.count({
      where: {
        user_id: userId,
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    return {
      totalFavorites,
      saleFavorites,
      rentFavorites,
      typeStats,
      recentFavorites
    };
  }

  // Obtener favoritos de múltiples propiedades (para verificar estado en listados)
  static async getFavoritesForProperties(userId: number, propertyIds: number[]) {
    const favorites = await Favorite.findAll({
      where: {
        user_id: userId,
        property_id: {
          [Op.in]: propertyIds
        }
      },
      attributes: ['property_id']
    });

    return favorites.map(fav => fav.property_id);
  }

  // Limpiar favoritos antiguos (más de 1 año)
  static async cleanOldFavorites() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const deletedCount = await Favorite.destroy({
      where: {
        created_at: {
          [Op.lt]: oneYearAgo
        }
      }
    });

    return deletedCount;
  }
}
