import { ClfinEntity, ClfinParams } from './entity/clfin.entity';

/**
 * Puerto (Port) para el repositorio de Información Financiera
 * Define el contrato de acceso a datos
 */
export interface ClfinPort {
  /**
   * Listar todas las informaciones financieras con filtros y paginación
   */
  findAll(params?: ClfinParams): Promise<{ data: ClfinEntity[]; total: number }>;

  /**
   * Obtener información financiera por ID
   */
  findById(id: number): Promise<ClfinEntity | null>;

  /**
   * Buscar informaciones financieras por ID de cliente (1:N)
   */
  findByClienId(clienId: number): Promise<ClfinEntity[]>;

  /**
   * Buscar información financiera por cliente y tipo (único por tipo)
   */
  findByClienIdAndTipo(clienId: number, tipoFinanciero: number): Promise<ClfinEntity | null>;

  /**
   * Crear nueva información financiera
   */
  create(data: ClfinEntity): Promise<ClfinEntity | null>;

  /**
   * Actualizar información financiera existente
   */
  update(id: number, data: ClfinEntity): Promise<ClfinEntity | null>;

  /**
   * Eliminar información financiera (soft delete)
   */
  delete(id: number): Promise<ClfinEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLFIN_REPOSITORY = Symbol('CLFIN_REPOSITORY');

