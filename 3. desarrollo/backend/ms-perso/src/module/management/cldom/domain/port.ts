import { CldomEntity, CldomParams } from './entity/cldom.entity';

/**
 * Puerto (Port) para el repositorio de Domicilio
 * Define el contrato de acceso a datos
 */
export interface CldomPort {
  /**
   * Listar todos los domicilios con filtros y paginación
   */
  findAll(params?: CldomParams): Promise<{ data: CldomEntity[]; total: number }>;

  /**
   * Obtener domicilio por ID
   */
  findById(id: number): Promise<CldomEntity | null>;

  /**
   * Buscar domicilio por ID de cliente (1:1)
   */
  findByClienId(clienId: number): Promise<CldomEntity | null>;

  /**
   * Crear nuevo domicilio
   */
  create(data: CldomEntity): Promise<CldomEntity | null>;

  /**
   * Actualizar domicilio existente
   */
  update(id: number, data: CldomEntity): Promise<CldomEntity | null>;

  /**
   * Eliminar domicilio (soft delete)
   */
  delete(id: number): Promise<CldomEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLDOM_REPOSITORY = Symbol('CLDOM_REPOSITORY');

