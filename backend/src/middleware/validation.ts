import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

// Middleware para validar los resultados de express-validator
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map((error: any) => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      error: 'VALIDATION_ERROR',
      validation_errors: validationErrors
    });
    return;
  }

  next();
};

// Middleware para ejecutar múltiples validaciones
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Ejecutar todas las validaciones
    await Promise.all(validations.map(validation => validation.run(req)));

    // Verificar si hay errores
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const validationErrors = errors.array().map((error: any) => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));

      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'VALIDATION_ERROR',
        validation_errors: validationErrors
      });
      return;
    }

    next();
  };
};

// Middleware para manejar errores de validación personalizados
export const handleValidationError = (error: any, req: Request, res: Response, next: NextFunction): void => {
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Error de validación',
      error: 'VALIDATION_ERROR',
      details: error.message
    });
    return;
  }

  next(error);
};
