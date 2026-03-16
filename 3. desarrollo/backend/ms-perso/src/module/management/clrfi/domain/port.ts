import { ClrfiEntity, ClrfiParams } from './entity/clrfi.entity';

/**
 * Puerto (Port) para el repositorio de Residencia Fiscal
 * Define el contrato de acceso a datos
 */
export interface ClrfiPort {
  /**
   * Listar todas las residencias fiscales con filtros y paginación
   */
  findAll(params?: ClrfiParams): Promise<{ data: ClrfiEntity[]; total: number }>;

  /**
   * Obtener residencia fiscal por ID
   */
  findById(id: number): Promise<ClrfiEntity | null>;

  /**
   * Buscar residencia fiscal por ID de cliente (1:1)
   */
  findByClienId(clienId: number): Promise<ClrfiEntity | null>;

  /**
   * Crear nueva residencia fiscal
   */
  create(data: ClrfiEntity): Promise<ClrfiEntity | null>;

  /**
   * Actualizar residencia fiscal existente
   */
  update(id: number, data: ClrfiEntity): Promise<ClrfiEntity | null>;

  /**
   * Eliminar residencia fiscal (soft delete)
   */
  delete(id: number): Promise<ClrfiEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLRFI_REPOSITORY = Symbol('CLRFI_REPOSITORY');

