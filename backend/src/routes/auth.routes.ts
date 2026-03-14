import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateDto } from '../middleware/validation/validation.middleware';
import { RegisterDto } from '../dto/auth/register.dto';
import { RegisterDoctorDto } from '../dto/auth/register-doctor.dto';
import rateLimit from 'express-rate-limit';

// Rate limiting: 3 intentos por hora por IP
const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos por ventana
  message: {
    error: 'Has excedido el límite de intentos de registro. Intenta nuevamente en una hora.',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Retorna información de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // Desactiva headers `X-RateLimit-*`
  handler: (_req, res) => {
    res.setHeader('Retry-After', Math.ceil(60 * 60)); // Segundos hasta que se puede intentar de nuevo
    res.status(429).json({
      error: 'Has excedido el límite de intentos de registro. Intenta nuevamente en una hora.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(60 * 60), // Segundos
      timestamp: new Date().toISOString(),
    });
  },
});

const router = Router();

// Middleware para validar según el tipo de registro
const validateRegister = async (req: any, res: any, next: any) => {
  // Si es registro de médico (tiene address y postalCode), validar con RegisterDoctorDto
  if (req.body.role === 'doctor' && (req.body.address || req.body.postalCode)) {
    return validateDto(RegisterDoctorDto)(req, res, next);
  }
  // Si no, validar con RegisterDto (paciente)
  return validateDto(RegisterDto)(req, res, next);
};

router.post(
  '/register',
  registerRateLimit,
  validateRegister,
  authController.register
);

router.post('/login', authController.login);

export default router;
