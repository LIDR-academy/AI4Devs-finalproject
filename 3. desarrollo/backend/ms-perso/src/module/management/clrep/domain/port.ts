import { ClrepEntity, ClrepParams } from './entity/clrep.entity';

/**
 * Puerto (Port) para el repositorio de Representante
 * Define el contrato de acceso a datos
 */
export interface ClrepPort {
  /**
   * Listar todos los representantes con filtros y paginación
   */
  findAll(params?: ClrepParams): Promise<{ data: ClrepEntity[]; total: number }>;

  /**
   * Obtener representante por ID
   */
  findById(id: number): Promise<ClrepEntity | null>;

  /**
   * Buscar representante por ID de cliente (1:1)
   */
  findByClienId(clienId: number): Promise<ClrepEntity | null>;

  /**
   * Crear nuevo representante
   */
  create(data: ClrepEntity): Promise<ClrepEntity | null>;

  /**
   * Actualizar representante existente
   */
  update(id: number, data: ClrepEntity): Promise<ClrepEntity | null>;

  /**
   * Eliminar representante (soft delete)
   */
  delete(id: number): Promise<ClrepEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLREP_REPOSITORY = Symbol('CLREP_REPOSITORY');

