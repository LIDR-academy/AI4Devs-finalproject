import { AppDataSource } from '../config/database';
import { User } from '../models/user.entity';
import { AuditLog } from '../models/audit-log.entity';
import { Doctor } from '../models/doctor.entity';
import { RegisterDto } from '../dto/auth/register.dto';
import { RegisterDoctorDto } from '../dto/auth/register-doctor.dto';
import { GeocodingService } from './geocoding.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { logger } from '../utils/logger';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private geocodingService: GeocodingService;

  constructor() {
    this.geocodingService = new GeocodingService();
  }

  private get userRepository() {
    if (!AppDataSource.isInitialized) {
      throw new Error('DataSource no está inicializado');
    }
    return AppDataSource.getRepository(User);
  }

  private get auditLogRepository() {
    if (!AppDataSource.isInitialized) {
      throw new Error('DataSource no está inicializado');
    }
    return AppDataSource.getRepository(AuditLog);
  }

  async register(registerDto: RegisterDto, ipAddress: string): Promise<AuthResponse> {
    // Usar transacción para asegurar atomicidad
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. Validar reCAPTCHA
      const recaptchaValid = await this.validateRecaptcha(registerDto.recaptchaToken);
      if (!recaptchaValid) {
        throw new Error('reCAPTCHA inválido');
      }

      // 2. Verificar email único
      const existingUser = await transactionalEntityManager.findOne(User, {
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new Error('Email ya está registrado');
      }

      // 3. Hash de contraseña
      const hashedPassword = await bcrypt.hash(registerDto.password, 12);

      // 4. Crear usuario
      const user = transactionalEntityManager.create(User, {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: registerDto.role,
        emailVerified: false,
      });

      const savedUser = await transactionalEntityManager.save(User, user);

      // 5. Generar tokens JWT
      const accessToken = this.generateAccessToken(savedUser);
      const refreshToken = this.generateRefreshToken(savedUser);

      // 6. Registrar en audit_logs
      await transactionalEntityManager.save(AuditLog, {
        action: 'register',
        entityType: 'user',
        entityId: savedUser.id,
        ipAddress: ipAddress,
        userId: savedUser.id,
      });

      // 7. Retornar respuesta
      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role,
          emailVerified: savedUser.emailVerified,
        },
        accessToken,
        refreshToken,
      };
    });
  }

  private async validateRecaptcha(token: string): Promise<boolean> {
    try {
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: token,
          },
        },
      );

      const { success, score } = response.data;
      const threshold = parseFloat(process.env.RECAPTCHA_THRESHOLD || '0.5');

      return success && score >= threshold;
    } catch (error) {
      logger.error('Error validando reCAPTCHA:', error);
      return false;
    }
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
    const expiresIn: string | number = process.env.JWT_ACCESS_EXPIRES_IN || '15m';

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  async login(email: string, password: string, ipAddress: string): Promise<AuthResponse> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    // 2. Verificar contraseña
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new Error('Email o contraseña incorrectos');
    }

    // 3. Generar tokens JWT
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // 4. Registrar en audit_logs
    await this.auditLogRepository.save({
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      ipAddress: ipAddress,
      userId: user.id,
    });

    // 5. Retornar respuesta
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    const secret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
    const expiresIn: string | number = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  /**
   * Registra un nuevo médico en el sistema
   * Crea usuario en USERS y perfil en DOCTORS con geocodificación
   */
  async registerDoctor(
    registerDto: RegisterDoctorDto,
    ipAddress: string,
  ): Promise<AuthResponse & { doctor?: { verificationStatus: string } }> {
    // Usar transacción para asegurar que todo se guarde correctamente
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. Validar reCAPTCHA
      const recaptchaValid = await this.validateRecaptcha(registerDto.recaptchaToken);
      if (!recaptchaValid) {
        throw new Error('reCAPTCHA inválido');
      }

      // 2. Verificar email único
      const existingUser = await transactionalEntityManager.findOne(User, {
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new Error('Email ya está registrado');
      }

      // 3. Geocodificar dirección (no bloquea el registro si falla)
      let coordinates: { latitude: number; longitude: number } | null = null;
      if (registerDto.latitude && registerDto.longitude) {
        // Si ya vienen coordenadas del frontend, usarlas
        coordinates = {
          latitude: registerDto.latitude,
          longitude: registerDto.longitude,
        };
      } else {
        // Intentar geocodificar
        coordinates = await this.geocodingService.geocodeAddress(
          registerDto.address,
          registerDto.postalCode,
        );
        if (!coordinates) {
          logger.warn(
            `Geocodificación falló para ${registerDto.address}, ${registerDto.postalCode}. Registro continuará sin coordenadas.`,
          );
        }
      }

      // 4. Hash de contraseña
      const hashedPassword = await bcrypt.hash(registerDto.password, 12);

      // 5. Crear usuario
      const user = transactionalEntityManager.create(User, {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: 'doctor' as const,
        emailVerified: false,
      });

      const savedUser = await transactionalEntityManager.save(User, user);
      
      // Asegurar que el role se guardó correctamente
      if (!savedUser.role || savedUser.role !== 'doctor') {
        throw new Error(`Error: el role no se guardó correctamente. Esperado: 'doctor', Obtenido: '${savedUser.role}'`);
      }

      // 6. Crear perfil médico
      const doctor = transactionalEntityManager.create(Doctor, {
        userId: savedUser.id,
        address: registerDto.address,
        postalCode: registerDto.postalCode,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        bio: registerDto.bio,
        verificationStatus: 'pending',
        ratingAverage: 0.0,
        totalReviews: 0,
      });

      const savedDoctor = await transactionalEntityManager.save(Doctor, doctor);

      // 7. Generar tokens JWT
      const accessToken = this.generateAccessToken(savedUser);
      const refreshToken = this.generateRefreshToken(savedUser);

      // 8. Registrar en audit_logs (usuario y médico)
      await transactionalEntityManager.save(AuditLog, {
        action: 'register',
        entityType: 'user',
        entityId: savedUser.id,
        ipAddress: ipAddress,
        userId: savedUser.id,
      });

      await transactionalEntityManager.save(AuditLog, {
        action: 'register',
        entityType: 'doctor',
        entityId: savedDoctor.id,
        ipAddress: ipAddress,
        userId: savedUser.id,
      });

      // 9. Retornar respuesta
      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role,
          emailVerified: savedUser.emailVerified,
        },
        accessToken,
        refreshToken,
        doctor: {
          verificationStatus: savedDoctor.verificationStatus,
        },
      };
    });
  }
}
