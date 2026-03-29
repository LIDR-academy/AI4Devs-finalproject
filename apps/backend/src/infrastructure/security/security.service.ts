import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export class SecurityService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: object, expiresIn: string | number = '1d'): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as any });
  }

  static verifyToken(token: string): any {
    return jwt.verify(token, env.JWT_SECRET);
  }
}
