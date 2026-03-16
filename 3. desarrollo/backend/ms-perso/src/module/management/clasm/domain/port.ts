import { ClasmEntity, ClasmParams } from './entity/clasm.entity';

/**
 * Puerto (Port) para el repositorio de Asamblea
 * Define el contrato de acceso a datos
 */
export interface ClasmPort {
  /**
   * Listar todas las asambleas con filtros y paginación
   */
  findAll(params?: ClasmParams): Promise<{ data: ClasmEntity[]; total: number }>;

  /**
   * Obtener asamblea por ID
   */
  findById(id: number): Promise<ClasmEntity | null>;

  /**
   * Buscar asamblea por ID de cliente (1:1)
   */
  findByClienId(clienId: number): Promise<ClasmEntity | null>;

  /**
   * Crear nueva asamblea
   */
  create(data: ClasmEntity): Promise<ClasmEntity | null>;

  /**
   * Actualizar asamblea existente
   */
  update(id: number, data: ClasmEntity): Promise<ClasmEntity | null>;

  /**
   * Eliminar asamblea (soft delete)
   */
  delete(id: number): Promise<ClasmEntity | null>;
}

/**
 * Token para inyección de dependencias
 */
export const CLASM_REPOSITORY = Symbol('CLASM_REPOSITORY');

