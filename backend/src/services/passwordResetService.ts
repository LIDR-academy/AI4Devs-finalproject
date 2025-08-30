import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import PasswordReset from '../models/PasswordReset';
import { IRequestPasswordReset, IResetPassword } from '../types';

export class PasswordResetService {
  // Solicitar reset de contraseña
  static async requestPasswordReset(data: IRequestPasswordReset): Promise<void> {
    const { email } = data;

    // Verificar que el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return;
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    
    // Token expira en 1 hora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Invalidar tokens anteriores para este email
    await PasswordReset.update(
      { used: true },
      { where: { email, used: false } }
    );

    // Crear nuevo token
    await PasswordReset.create({
      email,
      token,
      expires_at: expiresAt,
      used: false
    });

    // TODO: Enviar email con el token
    // Por ahora, solo logueamos el token para desarrollo
    console.log(`🔑 Token de recuperación para ${email}: ${token}`);
    console.log(`⏰ Expira en: ${expiresAt.toISOString()}`);
  }

  // Resetear contraseña con token
  static async resetPassword(data: IResetPassword): Promise<void> {
    const { token, new_password, confirm_password } = data;

    // Verificar que las contraseñas coincidan
    if (new_password !== confirm_password) {
      throw new Error('PASSWORDS_DONT_MATCH');
    }

    // Verificar que la contraseña cumple requisitos mínimos
    if (new_password.length < 8) {
      throw new Error('PASSWORD_TOO_SHORT');
    }

    // Buscar token válido
    const resetRecord = await PasswordReset.findOne({
      where: {
        token,
        used: false,
        expires_at: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!resetRecord) {
      throw new Error('INVALID_OR_EXPIRED_TOKEN');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(new_password, 12);

    // Actualizar contraseña del usuario
    await User.update(
      { password_hash: hashedPassword },
      { where: { email: resetRecord.email } }
    );

    // Marcar token como usado
    await resetRecord.update({ used: true });

    // Invalidar todos los tokens del usuario
    await PasswordReset.update(
      { used: true },
      { where: { email: resetRecord.email } }
    );
  }

  // Verificar si un token es válido
  static async verifyToken(token: string): Promise<boolean> {
    const resetRecord = await PasswordReset.findOne({
      where: {
        token,
        used: false,
        expires_at: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    return !!resetRecord;
  }

  // Limpiar tokens expirados (ejecutar periódicamente)
  static async cleanupExpiredTokens(): Promise<void> {
    await PasswordReset.update(
      { used: true },
      { 
        where: { 
          expires_at: { [require('sequelize').Op.lt]: new Date() },
          used: false
        } 
      }
    );
  }
}

