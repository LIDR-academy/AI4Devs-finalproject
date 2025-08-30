import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { authRateLimit } from '../middleware/rateLimit';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Validaciones para registro
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('El correo electrónico debe ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  body('role')
    .isIn(['user', 'agent', 'admin'])
    .withMessage('El rol debe ser user, agent o admin'),
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('El número de teléfono debe ser válido')
];

// Validaciones para login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('El correo electrónico debe ser válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Rutas públicas
router.post('/register', authRateLimit, validateRequest(registerValidation), AuthController.register);
router.post('/login', authRateLimit, validateRequest(loginValidation), AuthController.login);

// Rutas protegidas
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/verify', AuthController.verifyToken);

export default router;
