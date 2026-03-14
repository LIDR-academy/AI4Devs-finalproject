import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDoctorDto } from '../dto/auth/register-doctor.dto';
import { logger } from '../utils/logger';

const authService = new AuthService();

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      
      // Detectar si es registro de médico
      const isDoctorRegistration = req.body.role === 'doctor' && 
                                   req.body.address && 
                                   req.body.postalCode;

      let result;
      
      if (isDoctorRegistration) {
        // Validar que tenga los campos requeridos de médico
        const doctorDto = req.body as RegisterDoctorDto;
        if (!doctorDto.address || !doctorDto.postalCode) {
          return res.status(400).json({
            error: 'Dirección y código postal son obligatorios para médicos',
            code: 'MISSING_REQUIRED_FIELDS',
            timestamp: new Date().toISOString(),
          });
        }
        
        result = await authService.registerDoctor(doctorDto, ipAddress);
      } else {
        result = await authService.register(req.body, ipAddress);
      }

      // Configurar cookie httpOnly para refreshToken
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      const response: any = {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };

      // Si es médico, agregar información del perfil médico
      if (isDoctorRegistration && 'doctor' in result) {
        response.doctor = result.doctor;
        response.message = 'Registro exitoso. Tu cuenta está pendiente de verificación.';
      }

      return res.status(201).json(response);
    } catch (error) {
      logger.error('Error en registro:', error);

      // Manejar errores específicos
      if (error instanceof Error) {
        if (error.message === 'Email ya está registrado') {
          return res.status(409).json({
            error: error.message,
            code: 'EMAIL_ALREADY_EXISTS',
            timestamp: new Date().toISOString(),
          });
        }

        if (error.message === 'reCAPTCHA inválido') {
          return res.status(400).json({
            error: error.message,
            code: 'INVALID_RECAPTCHA',
            timestamp: new Date().toISOString(),
          });
        }
      }

      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email y contraseña son requeridos',
          code: 'MISSING_CREDENTIALS',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await authService.login(email, password, ipAddress);

      // Configurar cookie httpOnly para refreshToken
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      return res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      logger.error('Error en login:', error);

      if (error instanceof Error) {
        if (error.message === 'Email o contraseña incorrectos') {
          return res.status(401).json({
            error: error.message,
            code: 'INVALID_CREDENTIALS',
            timestamp: new Date().toISOString(),
          });
        }
      }

      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },
};
