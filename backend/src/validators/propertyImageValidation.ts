import { body, param } from 'express-validator';

export const propertyImageValidation = {
  // Validaciones para obtener imágenes de una propiedad
  getPropertyImages: [
    param('id_property')
      .isUUID()
      .withMessage('El ID de la propiedad debe ser un UUID válido')
  ],

  // Validaciones para subir imagen
  uploadPropertyImage: [
    param('id_property')
      .isUUID()
      .withMessage('El ID de la propiedad debe ser un UUID válido'),
    
    body('url')
      .isURL()
      .withMessage('La URL de la imagen debe ser válida'),
    
    body('cloudinary_id')
      .notEmpty()
      .withMessage('El ID de Cloudinary es requerido'),
    
    body('alt_text')
      .optional()
      .isLength({ max: 255 })
      .withMessage('El texto alternativo no puede exceder 255 caracteres'),
    
    body('is_primary')
      .optional()
      .isBoolean()
      .withMessage('is_primary debe ser un valor booleano')
  ],

  // Validaciones para eliminar imagen
  deletePropertyImage: [
    param('id_property')
      .isUUID()
      .withMessage('El ID de la propiedad debe ser un UUID válido'),
    
    param('id_image')
      .isUUID()
      .withMessage('El ID de la imagen debe ser un UUID válido')
  ]
};
