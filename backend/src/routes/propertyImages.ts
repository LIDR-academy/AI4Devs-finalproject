import { Router } from 'express';
import { PropertyImageController } from '../controllers/propertyImageController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { propertyImageValidation } from '../validators/propertyImageValidation';

const router = Router();

// GET /api/property-images/:id_property/images - Obtener imágenes de una propiedad
router.get(
  '/:id_property/images',
  validateRequest(propertyImageValidation.getPropertyImages),
  PropertyImageController.getPropertyImages
);

// POST /api/property-images/:id_property/images - Subir imagen a una propiedad
router.post(
  '/:id_property/images',
  authenticateToken,
  validateRequest(propertyImageValidation.uploadPropertyImage),
  PropertyImageController.uploadPropertyImage
);

// DELETE /api/property-images/:id_property/images/:id_image - Eliminar imagen
router.delete(
  '/:id_property/images/:id_image',
  authenticateToken,
  validateRequest(propertyImageValidation.deletePropertyImage),
  PropertyImageController.deletePropertyImage
);

export default router;
