import { ClbncEntity, ClbncParams } from './entity/clbnc.entity';

/**
 * Puerto (Port) para el repositorio de Usuario Banca Digital
 * Define el contrato de acceso a datos
 */
export interface ClbncPort {
  /**
   * Listar todos los usuarios de banca digital con filtros y paginación
   */
  findAll(params?: ClbncParams): Promise<{ data: ClbncEntity[]; total: number }>;

  /**
   * Obtener usuario de banca digital por ID
   */
  findById(id: number): Promise<ClbncEntity | null>;

  /**
   * Buscar usuario de banca digital por ID de cliente (1:1)
   */
  findByClienId(clienId: number): Promise<ClbncEntity | null>;

  /**
   * Buscar usuario de banca digital por username
   */
  findByUsername(username: string): Promise<ClbncEntity | null>;

  /**
   * Crear nuevo usuario de banca digital
   */
  create(data: ClbncEntity): Promise<ClbncEntity | null>;

  /**
   * Actualizar usuario de banca digital existente
   */
  update(id: number, data: ClbncEntity): Promise<ClbncEntity | null>;

  /**
   * Eliminar usuario de banca digital (soft delete)
   */
  delete(id: number): Promise<ClbncEntity | null>;

  // ========== AUTENTICACIÓN Y SEGURIDAD (APP MÓVIL) ==========

  /**
   * Autenticar usuario de banca digital (login desde app móvil)
   * @param username Username (email o cédula)
   * @param password Password en texto plano
   * @param deviceInfo Información del dispositivo (IMEI, nombre, detalles, IP, GPS)
   * @returns Usuario autenticado con token de sesión, o null si las credenciales son inválidas
   */
  login(
    username: string,
    password: string,
    deviceInfo: {
      imei?: string | null;
      nombreDispositivo?: string | null;
      detallesDispositivo?: string | null;
      ip?: string | null;
      latitud?: number | null;
      longitud?: number | null;
      geocoder?: string | null;
    }
  ): Promise<{ usuario: ClbncEntity; tokenSesion: string } | null>;

  /**
   * Cambiar contraseña del usuario de banca digital
   * @param id ID del usuario de banca digital
   * @param passwordActual Password actual en texto plano
   * @param passwordNuevo Nuevo password en texto plano
   * @returns Usuario actualizado, o null si el password actual es incorrecto
   */
  changePassword(
    id: number,
    passwordActual: string,
    passwordNuevo: string
  ): Promise<ClbncEntity | null>;

  /**
   * Iniciar proceso de recuperación de contraseña (generar código de verificación)
   * @param username Username del usuario
   * @returns Código de verificación generado, o null si el usuario no existe
   */
  iniciarRecuperacionPassword(username: string): Promise<{ codigoVerificacion: string; expiraEn: Date } | null>;

  /**
   * Completar recuperación de contraseña (validar código y establecer nuevo password)
   * @param username Username del usuario
   * @param codigoVerificacion Código de verificación
   * @param passwordNuevo Nuevo password en texto plano
   * @returns Usuario actualizado, o null si el código es inválido o expiró
   */
  completarRecuperacionPassword(
    username: string,
    codigoVerificacion: string,
    passwordNuevo: string
  ): Promise<ClbncEntity | null>;

  /**
   * Bloquear usuario de banca digital (inactivar acceso)
   * @param id ID del usuario de banca digital
   * @param motivo Motivo del bloqueo
   * @returns Usuario bloqueado
   */
  bloquear(id: number, motivo: string): Promise<ClbncEntity | null>;

  /**
   * Desbloquear usuario de banca digital (reactivar acceso)
   * @param id ID del usuario de banca digital
   * @returns Usuario desbloqueado
   */
  desbloquear(id: number): Promise<ClbncEntity | null>;

  /**
   * Verificar token de sesión y obtener usuario
   * @param tokenSesion Token de sesión
   * @returns Usuario asociado al token, o null si el token es inválido
   */
  verificarTokenSesion(tokenSesion: string): Promise<ClbncEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLBNC_REPOSITORY = Symbol('CLBNC_REPOSITORY');

