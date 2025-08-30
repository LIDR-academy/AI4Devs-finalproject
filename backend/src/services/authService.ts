import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_CONFIG } from '../config/jwt';
import User from '../models/User';
import redisClient from '../config/redis';
import { ICreateUser, ILoginUser, IAuthResponse, UserRole } from '../types';

export class AuthService {
  // Registro de usuario
  static async registerUser(userData: ICreateUser): Promise<IAuthResponse> {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Crear el usuario
    const user = await User.createUser(userData);
    
    // En desarrollo, marcar usuarios como verificados por defecto
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      await user.update({ verification_status: 'verified' });
    }

    // Generar token JWT
    const token = this.generateToken(user);

    // Actualizar último login
    await user.update({ last_login: new Date() });

    // Guardar token en Redis
    await redisClient.setEx(`token:${user.id}`, 86400, token);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        profile_picture: user.profile_picture,
        bio: user.bio,
        verification_status: user.verification_status,
        last_login: user.last_login,
        created_at: user.created_at
      },
      token
    };
  }

  // Login de usuario
  static async loginUser(loginData: ILoginUser): Promise<IAuthResponse> {
    // Buscar usuario por email
    const user = await User.findOne({ where: { email: loginData.email } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verificar si el usuario está activo
    if (!user.is_active) {
      throw new Error('ACCOUNT_DEACTIVATED');
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(loginData.password);
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generar token JWT
    const token = this.generateToken(user);

    // Actualizar último login
    await user.update({ last_login: new Date() });

    // Guardar token en Redis
    await redisClient.setEx(`token:${user.id}`, 86400, token);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        profile_picture: user.profile_picture,
        bio: user.bio,
        verification_status: user.verification_status,
        last_login: user.last_login,
        created_at: user.created_at
      },
      token
    };
  }

  // Logout de usuario
  static async logoutUser(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as any;
      
      // Agregar token a blacklist en Redis
      await redisClient.setEx(`blacklist:${token}`, 86400, '1');
      
      // Remover token activo del usuario
      await redisClient.del(`token:${decoded.user_id}`);
    } catch (error) {
      // Token inválido, no hacer nada
    }
  }

  // Verificar token
  static async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as any;
      
      // Verificar si el token está en blacklist
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new Error('TOKEN_BLACKLISTED');
      }

      return decoded;
    } catch (error) {
      throw new Error('INVALID_TOKEN');
    }
  }

  // Generar token JWT
  private static generateToken(user: User): string {
    return (jwt as any).sign(
      {
        user_id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_CONFIG.SECRET,
      { expiresIn: '24h' }
    );
  }
}
