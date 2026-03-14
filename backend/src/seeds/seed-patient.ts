import { AppDataSource } from '../config/database';
import { User } from '../models/user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export async function seedPatient(): Promise<{ user: User; token: string }> {
  try {
    const userRepository = AppDataSource.getRepository(User);

    // Buscar o crear paciente de prueba
    let user = await userRepository.findOne({
      where: { email: 'patient@test.com' },
    });

    if (!user) {
      user = userRepository.create({
        email: 'patient@test.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Paciente',
        lastName: 'Prueba',
        role: 'patient',
        emailVerified: true,
      });
      user = await userRepository.save(user);
      logger.info('✅ Paciente de prueba creado: patient@test.com');
    }

    // Generar token JWT (usando el mismo método que AuthService)
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
    const expiresIn: string | number = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const token = jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);

    return { user, token };
  } catch (error) {
    logger.error('Error al crear paciente de prueba:', error);
    throw error;
  }
}
