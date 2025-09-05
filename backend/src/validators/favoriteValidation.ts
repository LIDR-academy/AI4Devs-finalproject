import { body, param, query } from 'express-validator';

export const favoriteValidation = {
  // Validaciones para agregar a favoritos
  addToFavorites: [
    param('propertyId')
      .isUUID()
      .withMessage('El ID de la propiedad debe ser un UUID válido')
  ],

  // Validaciones para remover de favoritos
  removeFromFavorites: [
    param('propertyId')
      .isUUID()
      .withMessage('El ID de la propiedad debe ser un UUID válido')
  ],

  // Validaciones para verificar estado de favorito
  checkFavoriteStatus: [
    param('propertyId')
      .isUUID()
      .withMessage('El ID de la propiedad debe ser un UUID válido')
  ],

  // Validaciones para obtener favoritos del usuario
  getUserFavorites: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número entero positivo'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('El límite debe ser un número entre 1 y 50')
  ]
};
