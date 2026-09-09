import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticateByPinUseCase } from '../../../application/auth/use-cases/AuthenticateByPinUseCase.js';
import { CreateUserUseCase } from '../../../application/auth/use-cases/CreateUserUseCase.js';
import { SetUserStatusUseCase } from '../../../application/auth/use-cases/SetUserStatusUseCase.js';
import { ListUsersUseCase } from '../../../application/auth/use-cases/ListUsersUseCase.js';
import { UpdateUserUseCase } from '../../../application/auth/use-cases/UpdateUserUseCase.js';
import { ChangePinUseCase } from '../../../application/auth/use-cases/ChangePinUseCase.js';
import { RequestAdminPinResetUseCase } from '../../../application/auth/use-cases/RequestAdminPinResetUseCase.js';
import { ResetAdminPinUseCase } from '../../../application/auth/use-cases/ResetAdminPinUseCase.js';
import { handleZodOrNext } from '../utils/responseUtils.js';

const authPinSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es requerido.'),
  pin: z.string().regex(/^\d{4,6}$/, 'El PIN debe contener entre 4 y 6 digitos numericos.'),
});

const changePinSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es requerido.'),
  currentPin: z.string().regex(/^\d{4,6}$/, 'El PIN actual debe contener entre 4 y 6 digitos numericos.'),
  newPin: z.string().regex(/^\d{4,6}$/, 'El nuevo PIN debe contener entre 4 y 6 digitos numericos.'),
});

const forgotPinSchema = z.object({
  email: z.string().email('Debe ingresar un formato de correo electronico valido.'),
});

const resetPinSchema = z.object({
  token: z.string().min(16, 'El token de recuperacion es invalido.'),
  newPin: z.string().regex(/^\d{4,6}$/, 'El nuevo PIN debe contener entre 4 y 6 digitos numericos.'),
});

const createUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  role: z.string().min(1, 'El rol es requerido.'),
  pin: z.string().regex(/^\d{4,6}$/, 'El PIN debe contener entre 4 y 6 digitos numericos.'),
  email: z.string().email().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  pin: z.string().regex(/^\d{4,6}$/, 'El PIN debe contener entre 4 y 6 digitos numericos.').optional(),
  email: z.string().email().optional(),
});

const setUserStatusSchema = z.object({
  action: z.enum(['BLOCK', 'ACTIVATE']),
});

export class AuthController {
  constructor(
    private readonly authenticateByPinUseCase: AuthenticateByPinUseCase,
    private readonly createUserUseCase?: CreateUserUseCase,
    private readonly setUserStatusUseCase?: SetUserStatusUseCase,
    private readonly listUsersUseCase?: ListUsersUseCase,
    private readonly updateUserUseCase?: UpdateUserUseCase,
    private readonly changePinUseCase?: ChangePinUseCase,
    private readonly requestAdminPinResetUseCase?: RequestAdminPinResetUseCase,
    private readonly resetAdminPinUseCase?: ResetAdminPinUseCase
  ) {}

  public forgotPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = forgotPinSchema.parse(req.body);
      if (!this.requestAdminPinResetUseCase) {
        throw new Error('RequestAdminPinResetUseCase no configurado.');
      }
      const clientOrigin = req.headers.origin as string | undefined;
      const result = await this.requestAdminPinResetUseCase.execute({
        email: parsedBody.email,
        clientOrigin,
      });
      res.status(200).json(result);
    } catch (error) {
      handleZodOrNext(req, res, next, error);
    }
  };

  public resetPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = resetPinSchema.parse(req.body);
      if (!this.resetAdminPinUseCase) {
        throw new Error('ResetAdminPinUseCase no configurado.');
      }
      const result = await this.resetAdminPinUseCase.execute(parsedBody);
      res.status(200).json(result);
    } catch (error) {
      handleZodOrNext(req, res, next, error);
    }
  };


  public changePin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = changePinSchema.parse(req.body);
      if (!this.changePinUseCase) {
        throw new Error('ChangePinUseCase no configurado.');
      }
      const result = await this.changePinUseCase.execute(parsedBody);
      res.status(200).json(result);
    } catch (error) {
      handleZodOrNext(req, res, next, error);
    }
  };


  public loginWithPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = authPinSchema.parse(req.body);
      const result = await this.authenticateByPinUseCase.execute(parsedBody);
      res.status(200).json(result);
    } catch (error) {
      handleZodOrNext(req, res, next, error);
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
      handleZodOrNext(req, res, next, error);
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

  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const parsedBody = updateUserSchema.parse(req.body);

      if (!this.updateUserUseCase) {
        throw new Error('UpdateUserUseCase no configurado.');
      }

      const result = await this.updateUserUseCase.execute({ userId: id, ...parsedBody });
      res.status(200).json(result);
    } catch (error) {
      handleZodOrNext(req, res, next, error);
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
      handleZodOrNext(req, res, next, error);
    }
  };
}
