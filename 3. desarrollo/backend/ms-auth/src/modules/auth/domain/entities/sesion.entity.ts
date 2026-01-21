/**
 * Entidad de dominio Sesion
 * Representa una sesión activa del usuario
 */
export class SesionEntity {
  constructor(
    public readonly id: number,
    public readonly uuid: string,
    public readonly usuarioId: number,
    public readonly refreshTokenHash: string,
    public readonly tokenFamily: string,
    public readonly ipLogin: string,
    public readonly userAgent: string | null,
    public readonly deviceFingerprint: string | null,
    public readonly deviceName: string | null,
    public readonly activo: boolean,
    public readonly fechaCreacion: Date,
    public readonly fechaExpiracion: Date,
    public readonly fechaUltimaActividad: Date,
    public readonly fechaRevocacion: Date | null,
    public readonly motivoRevocacion: 'LOGOUT' | 'NEW_SESSION' | 'ADMIN' | 'EXPIRED' | 'TOKEN_REUSE' | 'PASSWORD_CHANGE' | null,
  ) {}

  /**
   * Verifica si la sesión está activa
   */
  estaActiva(): boolean {
    return this.activo && !this.fechaRevocacion && !this.estaExpirada();
  }

  /**
   * Verifica si la sesión ha expirado
   */
  estaExpirada(): boolean {
    return new Date() > this.fechaExpiracion;
  }
}

