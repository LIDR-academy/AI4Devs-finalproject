import { Request, Response } from 'express';
import { PasswordResetService } from '../services/passwordResetService';

export class PasswordResetController {
  // Solicitar reset de contraseña
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      await PasswordResetService.requestPasswordReset(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación'
      });
    } catch (error: any) {
      console.error('Error al solicitar reset de contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Resetear contraseña
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      await PasswordResetService.resetPassword(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Error al resetear contraseña:', error);
      
      if (error.message === 'PASSWORDS_DONT_MATCH') {
        res.status(400).json({
          success: false,
          message: 'Las contraseñas no coinciden',
          error: 'PASSWORDS_DONT_MATCH'
        });
      } else if (error.message === 'PASSWORD_TOO_SHORT') {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres',
          error: 'PASSWORD_TOO_SHORT'
        });
      } else if (error.message === 'INVALID_OR_EXPIRED_TOKEN') {
        res.status(400).json({
          success: false,
          message: 'El enlace de recuperación no es válido o ha expirado',
          error: 'INVALID_OR_EXPIRED_TOKEN'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: 'INTERNAL_ERROR'
        });
      }
    }
  }

  // Verificar token (para el frontend)
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const isValid_user = await PasswordResetService.verifyToken(token);
      
      res.status(200).json({
        success: true,
        data: { valid_user: isValid_user }
      });
    } catch (error: any) {
      console.error('Error al verificar token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }
}
