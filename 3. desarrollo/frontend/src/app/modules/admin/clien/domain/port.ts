import { Observable } from 'rxjs';
import { PersoEntity, ClienEntity, ClienteCompletoEntity, PersoParams, ClienParams } from './entity';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';

/**
 * Puerto (interfaz) para el módulo de Gestión de Clientes
 */
export interface ClienPort {
  // ==================== PERSONAS ====================
  
  /**
   * Obtiene listado de personas
   * @param params Parámetros de filtrado y paginación
   */
  getPersonas(params?: PersoParams): Observable<ApiResponses<PersoEntity>>;
  
  /**
   * Obtiene una persona por ID
   */
  getPersonaById(id: number): Observable<ApiResponse<PersoEntity>>;
  
  /**
   * Busca una persona por identificación
   */
  getPersonaByIdentificacion(identificacion: string): Observable<ApiResponse<PersoEntity>>;
  
  /**
   * Crea una nueva persona
   */
  createPersona(data: PersoEntity): Observable<ApiResponse<PersoEntity>>;
  
  /**
   * Actualiza una persona existente
   */
  updatePersona(id: number, data: PersoEntity): Observable<ApiResponse<PersoEntity>>;
  
  /**
   * Elimina (soft delete) una persona
   */
  deletePersona(id: number): Observable<ApiResponse<PersoEntity>>;
  
  // ==================== CLIENTES ====================
  
  /**
   * Obtiene listado de clientes
   * @param params Parámetros de filtrado y paginación
   */
  getClientes(params?: ClienParams): Observable<ApiResponses<ClienEntity>>;
  
  /**
   * Obtiene un cliente por ID
   */
  getClienteById(id: number): Observable<ApiResponse<ClienEntity>>;
  
  /**
   * Busca un cliente por ID de persona
   */
  getClienteByPersonaId(personaId: number): Observable<ApiResponse<ClienEntity>>;
  
  /**
   * Crea un nuevo cliente
   */
  createCliente(data: ClienEntity): Observable<ApiResponse<ClienEntity>>;
  
  /**
   * Actualiza un cliente existente
   */
  updateCliente(id: number, data: ClienEntity): Observable<ApiResponse<ClienEntity>>;
  
  /**
   * Elimina (soft delete) un cliente
   */
  deleteCliente(id: number): Observable<ApiResponse<ClienEntity>>;
  
  // ==================== TRANSACCIONES UNIFICADAS ====================
  
  /**
   * Registra un cliente completo con todos sus datos relacionados
   * Crea Persona + Cliente + Domicilio + Actividad Económica + relaciones opcionales
   */
  registrarClienteCompleto(data: ClienteCompletoEntity): Observable<ApiResponse<ClienteCompletoEntity>>;
  
  /**
   * Obtiene un cliente completo con todos sus datos relacionados
   */
  getClienteCompletoById(id: number): Observable<ApiResponse<ClienteCompletoEntity>>;
  
  /**
   * Actualiza un cliente completo con todos sus datos relacionados
   */
  actualizarClienteCompleto(id: number, data: ClienteCompletoEntity): Observable<ApiResponse<ClienteCompletoEntity>>;
}

