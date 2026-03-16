import { ClcygEntity, ClcygParams } from './entity/clcyg.entity';

/**
 * Puerto (Port) para el repositorio de Cónyuge
 * Define el contrato de acceso a datos
 */
export interface ClcygPort {
  /**
   * Listar todos los cónyuges con filtros y paginación
   */
  findAll(params?: ClcygParams): Promise<{ data: ClcygEntity[]; total: number }>;

  /**
   * Obtener cónyuge por ID
   */
  findById(id: number): Promise<ClcygEntity | null>;

  /**
   * Buscar cónyuge por ID de cliente (1:1)
   */
  findByClienId(clienId: number): Promise<ClcygEntity | null>;

  /**
   * Crear nuevo cónyuge
   */
  create(data: ClcygEntity): Promise<ClcygEntity | null>;

  /**
   * Actualizar cónyuge existente
   */
  update(id: number, data: ClcygEntity): Promise<ClcygEntity | null>;

  /**
   * Eliminar cónyuge (soft delete)
   */
  delete(id: number): Promise<ClcygEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLCYG_REPOSITORY = Symbol('CLCYG_REPOSITORY');

