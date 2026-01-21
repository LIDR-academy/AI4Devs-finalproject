import { CllabEntity, CllabParams } from './entity/cllab.entity';

/**
 * Puerto (Port) para el repositorio de Información Laboral
 * Define el contrato de acceso a datos
 */
export interface CllabPort {
  /**
   * Listar todas las informaciones laborales con filtros y paginación
   */
  findAll(params?: CllabParams): Promise<{ data: CllabEntity[]; total: number }>;

  /**
   * Obtener información laboral por ID
   */
  findById(id: number): Promise<CllabEntity | null>;

  /**
   * Buscar información laboral por ID de cliente (1:1)
   */
  findByClienId(clienId: number): Promise<CllabEntity | null>;

  /**
   * Crear nueva información laboral
   */
  create(data: CllabEntity): Promise<CllabEntity | null>;

  /**
   * Actualizar información laboral existente
   */
  update(id: number, data: CllabEntity): Promise<CllabEntity | null>;

  /**
   * Eliminar información laboral (soft delete)
   */
  delete(id: number): Promise<CllabEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLLAB_REPOSITORY = Symbol('CLLAB_REPOSITORY');

