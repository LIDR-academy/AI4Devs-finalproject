import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthenticateByPinUseCase } from '../../../application/auth/use-cases/AuthenticateByPinUseCase.js';
import { CreateUserUseCase } from '../../../application/auth/use-cases/CreateUserUseCase.js';
import { SetUserStatusUseCase } from '../../../application/auth/use-cases/SetUserStatusUseCase.js';
import { ListUsersUseCase } from '../../../application/auth/use-cases/ListUsersUseCase.js';
import { UpdateUserUseCase } from '../../../application/auth/use-cases/UpdateUserUseCase.js';
import { ChangePinUseCase } from '../../../application/auth/use-cases/ChangePinUseCase.js';
import { RequestAdminPinResetUseCase } from '../../../application/auth/use-cases/RequestAdminPinResetUseCase.js';
import { ResetAdminPinUseCase } from '../../../application/auth/use-cases/ResetAdminPinUseCase.js';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { IEmailService } from '../../../domain/auth/ports/IEmailService.js';
import { IRoleRepository } from '../../../domain/security/repositories/IRoleRepository.js';
import { ConsoleEmailService } from '../../notifications/ConsoleEmailService.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';
import { createAuthenticateJWTMiddleware } from '../middlewares/authenticateJWT.js';
import { authorizePermissions } from '../../security/http/middleware/authorizePermissions.middleware.js';

export function createAuthRouter(
  userRepository: IUserRepository,
  jwtSecret: string,
  roleRepository: IRoleRepository,
  emailService?: IEmailService,
  loginRateLimit: { windowMs: number; max: number } = { windowMs: 15 * 60 * 1000, max: 10 }
): Router {
  const router = Router();
  const mailer = emailService || new ConsoleEmailService();

  // TK-121 (US-015 Esc. 2): el roleRepository proyecta los permisos del rol al JWT
  // (solo para UX del cliente — la autorización real la resuelve authorizePermissions
  // en vivo, por petición, más abajo en este mismo archivo).
  const useCase = new AuthenticateByPinUseCase(userRepository, jwtSecret, roleRepository);
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const setUserStatusUseCase = new SetUserStatusUseCase(userRepository);
  const listUsersUseCase = new ListUsersUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);
  const changePinUseCase = new ChangePinUseCase(userRepository);
  const requestAdminPinResetUseCase = new RequestAdminPinResetUseCase(userRepository, mailer);
  const resetAdminPinUseCase = new ResetAdminPinUseCase(userRepository);

  const controller = new AuthController(
    useCase,
    createUserUseCase,
    setUserStatusUseCase,
    listUsersUseCase,
    updateUserUseCase,
    changePinUseCase,
    requestAdminPinResetUseCase,
    resetAdminPinUseCase
  );

  // Rate Limiting anti-fuerza bruta por IP real (Guard 16). Parametrizable vía
  // LOGIN_RATE_LIMIT_* (resuelto en app.ts); default 10 intentos / 15 min.
  const loginLimiter = createRateLimiter(loginRateLimit);

  const authMiddleware = createAuthenticateJWTMiddleware(jwtSecret);
  // TK-117 (US-015 Escenario 3): antes `requireRole('ADMIN')` fijo — sin cambio de
  // acceso real hoy (KITCHEN_STAFF no tiene `users:manage`), pero un rol personalizado
  // con `users:manage` concedido ahora también gestiona personal.
  const manageUsers = authorizePermissions(roleRepository, 'users:manage');

  router.post('/login-pin', loginLimiter, controller.loginWithPin);
  router.post('/forgot-pin', loginLimiter, controller.forgotPin);
  router.post('/reset-pin', loginLimiter, controller.resetPin);
  router.post('/change-pin', authMiddleware, controller.changePin);
  router.get('/users', authMiddleware, manageUsers, controller.listUsers);
  router.post('/users', authMiddleware, manageUsers, controller.createUser);
  router.put('/users/:id', authMiddleware, manageUsers, controller.updateUser);
  router.patch('/users/:id/status', authMiddleware, manageUsers, controller.setUserStatus);

  return router;
}
