import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthenticateByPinUseCase } from '../../../application/auth/use-cases/AuthenticateByPinUseCase.js';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';

export function createAuthRouter(
  userRepository: IUserRepository,
  jwtSecret: string
): Router {
  const router = Router();
  const useCase = new AuthenticateByPinUseCase(userRepository, jwtSecret);
  const controller = new AuthController(useCase);

  router.post('/login-pin', controller.loginWithPin);

  return router;
}
