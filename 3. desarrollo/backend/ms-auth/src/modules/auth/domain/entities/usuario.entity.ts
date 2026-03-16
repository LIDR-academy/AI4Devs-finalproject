/**
 * Entidad de dominio Usuario
 * Representa un usuario del sistema con toda su lógica de negocio
 */
export class UsuarioEntity {
  constructor(
    public readonly id: number,
    public readonly uuid: string,
    public readonly username: string,
    public readonly nombreCompleto: string,
    public readonly email: string | null,
    public readonly passwordHash: string,
    public readonly empresaId: number,
    public readonly oficinaId: number,
    public readonly perfilId: number,
    public readonly empleadoId: number | null,
    public readonly tipoUsuario: 'EMPLEADO' | 'EXTERNO' | 'SISTEMA',
    public readonly esAdmin: boolean,
    public readonly accesoGlobal: boolean,
    public readonly fechaUltimoPassword: Date,
    public readonly forzarCambioPassword: boolean,
    public readonly passwordNuncaExpira: boolean,
    public readonly intentosFallidos: number,
    public readonly fechaPrimerIntentoFallido: Date | null,
    public readonly bloqueadoHasta: Date | null,
    public readonly motivoBloqueo: string | null,
    public readonly fechaUltimoLogin: Date | null,
    public readonly ultimaIpLogin: string | null,
    public readonly mfaActivado: boolean,
    public readonly totpSecret: string | null,
    public readonly activo: boolean,
    public readonly esSistema: boolean,
    public readonly fechaEliminacion: Date | null,
  ) {}

  /**
   * Verifica si el usuario está activo y puede iniciar sesión
   */
  estaActivo(): boolean {
    return this.activo && !this.fechaEliminacion;
  }

  /**
   * Verifica si el usuario está bloqueado
   */
  estaBloqueado(): boolean {
    if (!this.bloqueadoHasta) return false;
    return new Date() < this.bloqueadoHasta;
  }

  /**
   * Verifica si el usuario es de tipo sistema (acceso 24/7)
   */
  esTipoSistema(): boolean {
    return this.tipoUsuario === 'SISTEMA' || this.esSistema;
  }

  /**
   * Verifica si debe cambiar la contraseña
   */
  debeCambiarPassword(diasVigencia: number): boolean {
    if (this.passwordNuncaExpira) return false;
    if (this.forzarCambioPassword) return true;
    
    const fechaExpiracion = new Date(this.fechaUltimoPassword);
    fechaExpiracion.setDate(fechaExpiracion.getDate() + diasVigencia);
    
    return new Date() >= fechaExpiracion;
  }

  /**
   * Verifica si el usuario puede intentar login según la ventana de intentos
   */
  puedeIntentarLogin(maxIntentos: number, ventanaMinutos: number): boolean {
    // Si no hay intentos fallidos, puede intentar
    if (this.intentosFallidos === 0) return true;

    // Si no hay fecha del primer intento fallido, puede intentar
    if (!this.fechaPrimerIntentoFallido) return true;

    // Si la ventana de tiempo ha expirado, resetear intentos
    const ventanaExpirada = new Date(this.fechaPrimerIntentoFallido);
    ventanaExpirada.setMinutes(ventanaExpirada.getMinutes() + ventanaMinutos);
    
    if (new Date() > ventanaExpirada) {
      return true; // La ventana expiró, puede intentar de nuevo
    }

    // Si aún está en la ventana, verificar si no excedió el máximo
    return this.intentosFallidos < maxIntentos;
  }
}

