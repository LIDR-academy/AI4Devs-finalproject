import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export function validateDto<T extends object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const formattedErrors = formatValidationErrors(errors);
      res.status(400).json({
        error: 'Error de validación',
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    req.body = dto;
    next();
  };
}

function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  errors.forEach((error) => {
    const property = error.property;
    const messages: string[] = [];

    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    if (error.children && error.children.length > 0) {
      const childErrors = formatValidationErrors(error.children);
      Object.keys(childErrors).forEach((key) => {
        formatted[`${property}.${key}`] = childErrors[key];
      });
    }

    if (messages.length > 0) {
      formatted[property] = messages;
    }
  });

  return formatted;
}
