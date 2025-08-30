import { body, query } from 'express-validator';

export const createPropertyValidators = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('El título debe tener entre 5 y 255 caracteres'),
  body('description')
    .optional()
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
    .withMessage('El número de recámaras debe ser un entero positivo'),
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

export const updatePropertyValidators = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('El título debe tener entre 5 y 255 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El número de recámaras debe ser un entero positivo'),
  body('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El número de baños debe ser un entero positivo')
];

export const propertyQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  query('property_type')
    .optional()
    .isIn(['house', 'apartment', 'office', 'land', 'commercial'])
    .withMessage('El tipo de propiedad debe ser válido'),
  query('operation_type')
    .optional()
    .isIn(['sale', 'rent', 'transfer'])
    .withMessage('El tipo de operación debe ser válido'),
  query('price_min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio mínimo debe ser un número positivo'),
  query('price_max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio máximo debe ser un número positivo'),
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ciudad debe tener entre 2 y 100 caracteres'),
  query('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El estado debe tener entre 2 y 100 caracteres')
];
