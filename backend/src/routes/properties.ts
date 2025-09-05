import { Router } from 'express';
import { body } from 'express-validator';
import { PropertyController } from '../controllers/propertyController';
import { authenticateToken, requireAgentOrAdmin } from '../middleware/auth';
import { propertyCreationRateLimit } from '../middleware/rateLimit';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Validaciones para crear propiedades
const propertyCreationValidation = [
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
    .withMessage('El estado debe tener entre 2 y 100 caracteres')
];

// Validaciones para actualizar propiedades (más flexibles)
const propertyUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('El título debe tener entre 5 y 255 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres'),
  body('property_type')
    .optional()
    .isIn(['house', 'apartment', 'office', 'land', 'commercial'])
    .withMessage('El tipo de propiedad debe ser válido'),
  body('operation_type')
    .optional()
    .isIn(['sale', 'rent', 'transfer'])
    .withMessage('El tipo de operación debe ser válido'),
  body('price')
    .optional()
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
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La dirección debe tener entre 10 y 500 caracteres'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ciudad debe tener entre 2 y 100 caracteres'),
  body('state')
    .optional()
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

// Rutas protegidas
router.get('/my-properties', 
  authenticateToken, 
  PropertyController.getUserProperties
);

router.post('/', 
  authenticateToken, 
  propertyCreationRateLimit, 
  validateRequest(propertyCreationValidation), 
  PropertyController.createProperty
);

router.put('/:id_property', 
  authenticateToken, 
  validateRequest(propertyUpdateValidation),
  PropertyController.updateProperty
);

// Ruta para incrementar vistas (sin autenticación) - DEBE ir antes de GET /:id_property
router.post('/:id_property/increment-views', 
  PropertyController.incrementViews
);

router.get('/:id_property', PropertyController.getPropertyById);

router.delete('/:id_property', 
  authenticateToken, 
  PropertyController.deleteProperty
);

router.patch('/:id_property/featured', 
  authenticateToken, 
  PropertyController.toggleFeatured
);

router.patch('/:id_property/status', 
  authenticateToken, 
  PropertyController.updatePropertyStatus
);

export default router;
