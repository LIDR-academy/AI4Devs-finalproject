import { Observable } from 'rxjs';
import { ActividadCompletaEntity, ArbolCiiuEntity } from './entity';

/**
 * Puerto (interfaz) para el repositorio de catálogo CIIU
 */
export interface CiiuPort {
  /**
   * Busca actividades por descripción (autocomplete)
   * @param query Texto de búsqueda (mínimo 3 caracteres)
   * @param limit Número máximo de resultados (máximo 50, por defecto 20)
   */
  searchActividades(query: string, limit?: number): Observable<ActividadCompletaEntity[]>;
  
  /**
   * Obtiene una actividad con toda su jerarquía completa
   * @param id ID de la actividad
   */
  findActividadCompleta(id: number): Observable<ActividadCompletaEntity | null>;
  
  /**
   * Obtiene una actividad completa por su código abreviado
   * @param abr Código CIIU (ej: "A011112")
   */
  findActividadCompletaByAbr(abr: string): Observable<ActividadCompletaEntity | null>;

  /**
   * Obtiene el árbol completo para navegación
   */
  findArbolCompleto(): Observable<ArbolCiiuEntity[]>;
  
  /**
   * Obtiene hijos de un nodo específico
   * @param nivel Nivel del nodo (1-6)
   * @param parentId ID del nodo padre
   */
  findHijosByNivel(nivel: number, parentId: number): Observable<ArbolCiiuEntity[]>;
}

