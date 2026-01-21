import { Observable } from 'rxjs';
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from './entity';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';

/**
 * Puerto (interfaz) para el módulo de Catálogo Geográfico
 */
export interface GeoPort {
  // ==================== PROVINCIAS ====================
  
  /**
   * Obtiene listado de provincias
   * @param activeOnly Si es true, solo retorna provincias activas
   */
  getProvincias(activeOnly?: boolean): Observable<ApiResponses<ProvinciaEntity>>;
  
  /**
   * Crea una nueva provincia
   */
  createProvincia(data: ProvinciaEntity): Observable<ApiResponse<ProvinciaEntity>>;
  
  /**
   * Actualiza una provincia existente
   */
  updateProvincia(id: number, data: ProvinciaEntity): Observable<ApiResponse<ProvinciaEntity>>;
  
  /**
   * Elimina (soft delete) una provincia
   */
  deleteProvincia(id: number): Observable<ApiResponse<ProvinciaEntity>>;
  
  // ==================== CANTONES ====================
  
  /**
   * Obtiene cantones de una provincia específica
   * @param provinciaCodigoSeps Código SEPS de la provincia (2 dígitos)
   * @param activeOnly Si es true, solo retorna cantones activos
   */
  getCantonesByProvincia(
    provinciaCodigoSeps: string, 
    activeOnly?: boolean
  ): Observable<ApiResponses<CantonEntity>>;
  
  /**
   * Crea un nuevo cantón
   */
  createCanton(data: CantonEntity): Observable<ApiResponse<CantonEntity>>;
  
  /**
   * Actualiza un cantón existente
   */
  updateCanton(id: number, data: CantonEntity): Observable<ApiResponse<CantonEntity>>;
  
  /**
   * Elimina (soft delete) un cantón
   */
  deleteCanton(id: number): Observable<ApiResponse<CantonEntity>>;
  
  // ==================== PARROQUIAS ====================
  
  /**
   * Obtiene parroquias de un cantón específico
   * @param provinciaCodigoSeps Código SEPS de la provincia
   * @param cantonCodigoSeps Código SEPS del cantón
   * @param activeOnly Si es true, solo retorna parroquias activas
   */
  getParroquiasByCanton(
    provinciaCodigoSeps: string, 
    cantonCodigoSeps: string, 
    activeOnly?: boolean
  ): Observable<ApiResponses<ParroquiaEntity>>;
  
  /**
   * Busca parroquias por texto
   * @param query Texto a buscar
   * @param limit Límite de resultados (default 20)
   */
  searchParroquias(query: string, limit?: number): Observable<ApiResponses<ParroquiaEntity>>;
  
  /**
   * Crea una nueva parroquia
   */
  createParroquia(data: ParroquiaEntity): Observable<ApiResponse<ParroquiaEntity>>;
  
  /**
   * Actualiza una parroquia existente
   */
  updateParroquia(id: number, data: ParroquiaEntity): Observable<ApiResponse<ParroquiaEntity>>;
  
  /**
   * Elimina (soft delete) una parroquia
   */
  deleteParroquia(id: number): Observable<ApiResponse<ParroquiaEntity>>;
}

