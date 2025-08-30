import { Router } from 'express';
import { body } from 'express-validator';
import { PasswordResetController } from '../controllers/passwordResetController';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Validaciones para solicitar reset
const requestResetValidation = [
  body('email')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail()
];

// Validaciones para resetear contraseña
const resetPasswordValidation = [
  body('token')
    .isLength({ min: 32, max: 64 })
    .withMessage('El token debe ser válido'),
  body('new_password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// Rutas públicas
router.post('/request', 
  requestResetValidation, 
  validateRequest, 
  PasswordResetController.requestPasswordReset
);

router.post('/reset', 
  resetPasswordValidation, 
  validateRequest, 
  PasswordResetController.resetPassword
);

router.get('/verify/:token', 
  PasswordResetController.verifyToken
);

export default router;

