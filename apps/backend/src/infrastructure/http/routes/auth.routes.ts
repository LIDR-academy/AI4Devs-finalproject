import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthenticateByPinUseCase } from '../../../application/auth/use-cases/AuthenticateByPinUseCase.js';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

export function createAuthRouter(
  userRepository: IUserRepository,
  jwtSecret: string
): Router {
  const router = Router();
  const useCase = new AuthenticateByPinUseCase(userRepository, jwtSecret);
  const controller = new AuthController(useCase);

  // Rate Limiting anti-fuerza bruta: max 10 intentos por cada 15 min por IP (Guard 16)
  const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

  router.post('/login-pin', loginLimiter, controller.loginWithPin);

  return router;
}
