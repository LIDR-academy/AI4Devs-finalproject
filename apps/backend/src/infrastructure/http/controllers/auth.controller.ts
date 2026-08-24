import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticateByPinUseCase } from '../../../application/auth/use-cases/AuthenticateByPinUseCase.js';
import { CreateUserUseCase } from '../../../application/auth/use-cases/CreateUserUseCase.js';
import { SetUserStatusUseCase } from '../../../application/auth/use-cases/SetUserStatusUseCase.js';
import { ListUsersUseCase } from '../../../application/auth/use-cases/ListUsersUseCase.js';

export const authPinSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es requerido.'),
  pin: z.string().regex(/^\d{4,6}$/, 'El PIN debe contener entre 4 y 6 digitos numericos.'),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  role: z.enum(['ADMIN', 'KITCHEN_STAFF']),
  pin: z.string().regex(/^\d{4,6}$/, 'El PIN debe contener entre 4 y 6 digitos numericos.'),
});

export const setUserStatusSchema = z.object({
  action: z.enum(['BLOCK', 'ACTIVATE']),
});

function respondValidationError(req: Request, res: Response, detailMsg: string): void {
  res.status(400).json({
    type: 'https://restostock.com/errors/validation-error',
    title: 'ValidationError',
    status: 400,
    detail: detailMsg,
    instance: req.originalUrl || req.url,
    error: 'ValidationError',
    message: detailMsg,
  });
}

export class AuthController {
  constructor(
    private readonly authenticateByPinUseCase: AuthenticateByPinUseCase,
    private readonly createUserUseCase?: CreateUserUseCase,
    private readonly setUserStatusUseCase?: SetUserStatusUseCase,
    private readonly listUsersUseCase?: ListUsersUseCase
  ) {}

  public loginWithPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = authPinSchema.parse(req.body);
      const result = await this.authenticateByPinUseCase.execute(parsedBody);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = createUserSchema.parse(req.body);

      if (!this.createUserUseCase) {
        throw new Error('CreateUserUseCase no configurado.');
      }

      const result = await this.createUserUseCase.execute(parsedBody);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };

  public listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.listUsersUseCase) {
        throw new Error('ListUsersUseCase no configurado.');
      }
      const result = await this.listUsersUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public setUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const parsedBody = setUserStatusSchema.parse(req.body);

      if (!this.setUserStatusUseCase) {
        throw new Error('SetUserStatusUseCase no configurado.');
      }

      const result = await this.setUserStatusUseCase.execute({ userId: id, action: parsedBody.action });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        respondValidationError(req, res, error.errors.map((e) => e.message).join('; '));
        return;
      }
      next(error);
    }
  };
}
