import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', authController.register.bind(authController));

router.post('/login', authController.login.bind(authController));

router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router; 