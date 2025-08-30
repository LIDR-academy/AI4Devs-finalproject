import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  // Registro de usuario
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const authResponse = await AuthService.registerUser(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: authResponse
      });
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado',
          error: 'EMAIL_ALREADY_EXISTS'
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

  // Login de usuario
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const authResponse = await AuthService.loginUser(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: authResponse
      });
    } catch (error: any) {
      console.error('Error en login:', error);
      
      if (error.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          error: 'INVALID_CREDENTIALS'
        });
      } else if (error.message === 'ACCOUNT_DEACTIVATED') {
        res.status(401).json({
          success: false,
          message: 'Cuenta desactivada',
          error: 'ACCOUNT_DEACTIVATED'
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

  // Logout de usuario
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        await AuthService.logoutUser(token);
      }

      res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Obtener perfil del usuario autenticado
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: user
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Verificar token
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token no proporcionado',
          error: 'MISSING_TOKEN'
        });
        return;
      }

      const decoded = await AuthService.verifyToken(token);
      
      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: decoded
      });
    } catch (error: any) {
      if (error.message === 'TOKEN_BLACKLISTED' || error.message === 'INVALID_TOKEN') {
        res.status(401).json({
          success: false,
          message: 'Token inválido',
          error: 'INVALID_TOKEN'
        });
      } else {
        console.error('Error al verificar token:', error);
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: 'INTERNAL_ERROR'
        });
      }
    }
  }
}
