import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthenticateByPinUseCase } from '../../../application/auth/use-cases/AuthenticateByPinUseCase.js';
import { CreateUserUseCase } from '../../../application/auth/use-cases/CreateUserUseCase.js';
import { SetUserStatusUseCase } from '../../../application/auth/use-cases/SetUserStatusUseCase.js';
import { ListUsersUseCase } from '../../../application/auth/use-cases/ListUsersUseCase.js';
import { UpdateUserUseCase } from '../../../application/auth/use-cases/UpdateUserUseCase.js';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';
import { createAuthenticateJWTMiddleware } from '../middlewares/authenticateJWT.js';
import { requireRole } from '../middlewares/requireRole.js';

export function createAuthRouter(
  userRepository: IUserRepository,
  jwtSecret: string
): Router {
  const router = Router();
  const useCase = new AuthenticateByPinUseCase(userRepository, jwtSecret);
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const setUserStatusUseCase = new SetUserStatusUseCase(userRepository);
  const listUsersUseCase = new ListUsersUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);
  const controller = new AuthController(
    useCase,
    createUserUseCase,
    setUserStatusUseCase,
    listUsersUseCase,
    updateUserUseCase
  );

  // Rate Limiting anti-fuerza bruta: max 10 intentos por cada 15 min por IP (Guard 16)
  const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

  const authMiddleware = createAuthenticateJWTMiddleware(jwtSecret);

  router.post('/login-pin', loginLimiter, controller.loginWithPin);
  router.get('/users', authMiddleware, requireRole('ADMIN'), controller.listUsers);
  router.post('/users', authMiddleware, requireRole('ADMIN'), controller.createUser);
  router.put('/users/:id', authMiddleware, requireRole('ADMIN'), controller.updateUser);
  router.patch('/users/:id/status', authMiddleware, requireRole('ADMIN'), controller.setUserStatus);

  return router;
}
