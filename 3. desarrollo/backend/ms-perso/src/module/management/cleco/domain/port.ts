import { ClecoEntity, ClecoParams } from './entity/cleco.entity';

/**
 * Puerto (Port) para el repositorio de Actividad Económica
 * Define el contrato de acceso a datos
 */
export interface ClecoPort {
  /**
   * Listar todas las actividades económicas con filtros y paginación
   */
  findAll(params?: ClecoParams): Promise<{ data: ClecoEntity[]; total: number }>;

  /**
   * Obtener actividad económica por ID
   */
  findById(id: number): Promise<ClecoEntity | null>;

  /**
   * Buscar actividad económica por ID de cliente (1:1)
   */
  findByClienId(clienId: number): Promise<ClecoEntity | null>;

  /**
   * Crear nueva actividad económica
   */
  create(data: ClecoEntity): Promise<ClecoEntity | null>;

  /**
   * Actualizar actividad económica existente
   */
  update(id: number, data: ClecoEntity): Promise<ClecoEntity | null>;

  /**
   * Eliminar actividad económica (soft delete)
   */
  delete(id: number): Promise<ClecoEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLECO_REPOSITORY = Symbol('CLECO_REPOSITORY');

