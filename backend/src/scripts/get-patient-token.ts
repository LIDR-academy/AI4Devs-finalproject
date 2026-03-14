import { AppDataSource } from '../config/database';
import { User } from '../models/user.entity';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function getPatientToken() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email: 'patient@test.com' },
    });

    if (!user) {
      console.error('Paciente no encontrado');
      process.exit(1);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
    const expiresIn: string | number = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const token = jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);

    console.log('Token generado:');
    console.log(token);
    console.log('\nUsuario:');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`\nSecret usado: ${secret}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

getPatientToken();
