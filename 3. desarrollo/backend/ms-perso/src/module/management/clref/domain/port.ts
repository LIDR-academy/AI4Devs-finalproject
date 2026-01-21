import { ClrefEntity, ClrefParams } from './entity/clref.entity';

/**
 * Puerto (Port) para el repositorio de Referencias
 * Define el contrato de acceso a datos
 */
export interface ClrefPort {
  /**
   * Listar todas las referencias con filtros y paginación
   */
  findAll(params?: ClrefParams): Promise<{ data: ClrefEntity[]; total: number }>;

  /**
   * Obtener referencia por ID
   */
  findById(id: number): Promise<ClrefEntity | null>;

  /**
   * Buscar referencias por ID de cliente (1:N)
   */
  findByClienId(clienId: number): Promise<ClrefEntity[]>;

  /**
   * Crear nueva referencia
   */
  create(data: ClrefEntity): Promise<ClrefEntity | null>;

  /**
   * Actualizar referencia existente
   */
  update(id: number, data: ClrefEntity): Promise<ClrefEntity | null>;

  /**
   * Eliminar referencia (soft delete)
   */
  delete(id: number): Promise<ClrefEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLREF_REPOSITORY = Symbol('CLREF_REPOSITORY');

