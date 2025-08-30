import { Router } from 'express';
import { body } from 'express-validator';
import { PropertyController } from '../controllers/propertyController';
import { authenticateToken, requireAgentOrAdmin } from '../middleware/auth';
import { propertyCreationRateLimit } from '../middleware/rateLimit';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Validaciones para crear/actualizar propiedades
const propertyValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('El título debe tener entre 5 y 255 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres'),
  body('property_type')
    .isIn(['house', 'apartment', 'office', 'land', 'commercial'])
    .withMessage('El tipo de propiedad debe ser válido'),
  body('operation_type')
    .isIn(['sale', 'rent', 'transfer'])
    .withMessage('El tipo de operación debe ser válido'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('La moneda debe tener 3 caracteres'),
  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El número de habitaciones debe ser un entero positivo'),
  body('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El número de baños debe ser un entero positivo'),
  body('sq_meters')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Los metros cuadrados deben ser un número positivo'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La dirección debe tener entre 10 y 500 caracteres'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ciudad debe tener entre 2 y 100 caracteres'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El estado debe tener entre 2 y 100 caracteres'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Las amenidades deben ser un array')
];

// Rutas públicas
router.get('/', PropertyController.getProperties);
router.get('/:id', PropertyController.getPropertyById);

// Rutas protegidas
router.post('/', 
  authenticateToken, 
  requireAgentOrAdmin, 
  propertyCreationRateLimit, 
  validateRequest(propertyValidation), 
  PropertyController.createProperty
);

router.put('/:id', 
  authenticateToken, 
  validateRequest(propertyValidation), 
  PropertyController.updateProperty
);

router.delete('/:id', 
  authenticateToken, 
  PropertyController.deleteProperty
);

router.get('/user/me', 
  authenticateToken, 
  PropertyController.getUserProperties
);

router.patch('/:id/featured', 
  authenticateToken, 
  PropertyController.toggleFeatured
);

export default router;
