import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/prisma-user.repository';
import { PrismaProjectRepository } from '@/infrastructure/database/repositories/prisma-project.repository';
import { PrismaInvitationRepository } from '@/infrastructure/database/repositories/prisma-invitation.repository';
import { RegisterUserUseCase } from '@/application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '@/application/use-cases/login-user.use-case';
import { GetCurrentUserUseCase } from '@/application/use-cases/get-current-user.use-case';
import { GuestLoginUseCase } from '@/application/use-cases/guest-login.use-case';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Composition Root (Wiring dependencies)
const userRepository = new PrismaUserRepository();
const projectRepository = new PrismaProjectRepository();
const invitationRepository = new PrismaInvitationRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
const guestLoginUseCase = new GuestLoginUseCase(invitationRepository, projectRepository);
const authController = new AuthController(registerUserUseCase, loginUserUseCase, getCurrentUserUseCase, guestLoginUseCase);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));
router.post('/guest/login', (req, res) => authController.guestLogin(req, res));

export default router;

