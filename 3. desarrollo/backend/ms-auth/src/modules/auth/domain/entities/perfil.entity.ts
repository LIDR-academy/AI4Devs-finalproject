import { PasswordPolicy } from '../value-objects/password-policy.vo';
import { TokenConfig } from '../value-objects/token-config.vo';
import { LockoutPolicy } from '../value-objects/lockout-policy.vo';

/**
 * Entidad de dominio Perfil
 * Representa un perfil de usuario con políticas de seguridad
 */
export class PerfilEntity {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly descripcion: string | null,
    public readonly accessTokenMinutes: number,
    public readonly refreshTokenDays: number,
    public readonly minPasswordLength: number,
    public readonly maxPasswordLength: number,
    public readonly requiereMayuscula: boolean,
    public readonly requiereMinuscula: boolean,
    public readonly requiereNumero: boolean,
    public readonly requiereEspecial: boolean,
    public readonly diasVigenciaPassword: number,
    public readonly historialPasswordCount: number,
    public readonly maxIntentosFallidos: number,
    public readonly minutosBloqueo: number,
    public readonly ventanaMinutos: number,
    public readonly sesionUnica: boolean,
    public readonly timeoutMinutos: number,
    public readonly requiereMFA: boolean,
    public readonly activo: boolean,
    public readonly esDefecto: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaModificacion: Date,
  ) {}

  /**
   * Obtiene la política de contraseñas
   */
  getPasswordPolicy(): PasswordPolicy {
    return new PasswordPolicy(
      this.minPasswordLength,
      this.maxPasswordLength,
      this.requiereMayuscula,
      this.requiereMinuscula,
      this.requiereNumero,
      this.requiereEspecial,
      this.diasVigenciaPassword,
      this.historialPasswordCount,
    );
  }

  /**
   * Obtiene la configuración de tokens
   */
  getTokenConfig(): TokenConfig {
    return new TokenConfig(
      this.accessTokenMinutes,
      this.refreshTokenDays,
    );
  }

  /**
   * Obtiene la política de bloqueo
   */
  getLockoutPolicy(): LockoutPolicy {
    return new LockoutPolicy(
      this.maxIntentosFallidos,
      this.minutosBloqueo,
      this.ventanaMinutos,
    );
  }
}

