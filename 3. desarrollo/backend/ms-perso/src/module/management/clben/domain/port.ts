import { ClbenEntity, ClbenParams } from './entity/clben.entity';

/**
 * Puerto (Port) para el repositorio de Beneficiarios
 * Define el contrato de acceso a datos
 */
export interface ClbenPort {
  /**
   * Listar todos los beneficiarios con filtros y paginación
   */
  findAll(params?: ClbenParams): Promise<{ data: ClbenEntity[]; total: number }>;

  /**
   * Obtener beneficiario por ID
   */
  findById(id: number): Promise<ClbenEntity | null>;

  /**
   * Buscar beneficiarios por ID de usuario de banca digital (1:N)
   */
  findByClbncId(clbncId: number): Promise<ClbenEntity[]>;

  /**
   * Crear nuevo beneficiario
   */
  create(data: ClbenEntity): Promise<ClbenEntity | null>;

  /**
   * Actualizar beneficiario existente
   */
  update(id: number, data: ClbenEntity): Promise<ClbenEntity | null>;

  /**
   * Eliminar beneficiario (soft delete)
   */
  delete(id: number): Promise<ClbenEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLBEN_REPOSITORY = Symbol('CLBEN_REPOSITORY');

