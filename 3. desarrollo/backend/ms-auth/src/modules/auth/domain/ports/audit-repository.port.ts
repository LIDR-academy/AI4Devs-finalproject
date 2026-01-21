/**
 * Datos de un evento de auditoría
 */
export interface AuditEvent {
  tipoEvento: string;
  categoriaEvento?: string;
  usuarioId?: number | null;
  nombreUsuario?: string | null;
  sesionUuid?: string | null;
  ipLogin: string;
  userAgent?: string | null;
  exito: boolean;
  motivoError?: string | null;
  empresaId?: number | null;
  oficinaId?: number | null;
  datosEvento?: Record<string, any>;
}

/**
 * Puerto (interfaz) para el repositorio de auditoría
 */
export interface IAuditRepository {
  log(event: AuditEvent): Promise<void>;
}

/**
 * Token para inyección de dependencias
 */
export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

