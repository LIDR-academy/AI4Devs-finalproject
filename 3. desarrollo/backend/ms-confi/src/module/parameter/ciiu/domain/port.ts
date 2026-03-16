import {
  SeccionEntity, DivisionEntity, GrupoEntity,
  ClaseEntity, SubclaseEntity, ActividadEntity,
  ActividadCompletaEntity, ArbolCiiuEntity
} from "./entity";

/**
 * Puerto (interfaz) para el repositorio de catálogo CIIU
 */
export interface CiiuPort {
  // ==================== SECCIÓN (Nivel 1) ====================
  createSeccion(data: SeccionEntity): Promise<SeccionEntity | null>;
  findAllSecciones(): Promise<SeccionEntity[]>;
  findSeccionById(id: number): Promise<SeccionEntity | null>;
  findSeccionByAbr(abr: string): Promise<SeccionEntity | null>;
  updateSeccion(id: number, data: SeccionEntity): Promise<SeccionEntity | null>;
  deleteSeccion(id: number): Promise<SeccionEntity | null>;  // Soft delete

  // ==================== DIVISIÓN (Nivel 2) ====================
  createDivision(data: DivisionEntity): Promise<DivisionEntity | null>;
  findAllDivisiones(): Promise<DivisionEntity[]>;
  findDivisionesBySeccion(cisecId: number): Promise<DivisionEntity[]>;
  findDivisionById(id: number): Promise<DivisionEntity | null>;
  updateDivision(id: number, data: DivisionEntity): Promise<DivisionEntity | null>;
  deleteDivision(id: number): Promise<DivisionEntity | null>;  // Soft delete

  // ==================== GRUPO (Nivel 3) ====================
  createGrupo(data: GrupoEntity): Promise<GrupoEntity | null>;
  findAllGrupos(): Promise<GrupoEntity[]>;
  findGruposByDivision(cidivId: number): Promise<GrupoEntity[]>;
  findGrupoById(id: number): Promise<GrupoEntity | null>;
  updateGrupo(id: number, data: GrupoEntity): Promise<GrupoEntity | null>;
  deleteGrupo(id: number): Promise<GrupoEntity | null>;  // Soft delete

  // ==================== CLASE (Nivel 4) ====================
  createClase(data: ClaseEntity): Promise<ClaseEntity | null>;
  findAllClases(): Promise<ClaseEntity[]>;
  findClasesByGrupo(cigruId: number): Promise<ClaseEntity[]>;
  findClaseById(id: number): Promise<ClaseEntity | null>;
  updateClase(id: number, data: ClaseEntity): Promise<ClaseEntity | null>;
  deleteClase(id: number): Promise<ClaseEntity | null>;  // Soft delete

  // ==================== SUBCLASE (Nivel 5) ====================
  createSubclase(data: SubclaseEntity): Promise<SubclaseEntity | null>;
  findAllSubclases(): Promise<SubclaseEntity[]>;
  findSubclasesByClase(ciclaId: number): Promise<SubclaseEntity[]>;
  findSubclaseById(id: number): Promise<SubclaseEntity | null>;
  updateSubclase(id: number, data: SubclaseEntity): Promise<SubclaseEntity | null>;
  deleteSubclase(id: number): Promise<SubclaseEntity | null>;  // Soft delete

  // ==================== ACTIVIDAD (Nivel 6) ====================
  createActividad(data: ActividadEntity): Promise<ActividadEntity | null>;
  findAllActividades(): Promise<ActividadEntity[]>;
  findActividadesBySubclase(cisubId: number): Promise<ActividadEntity[]>;
  findActividadById(id: number): Promise<ActividadEntity | null>;
  updateActividad(id: number, data: ActividadEntity): Promise<ActividadEntity | null>;
  deleteActividad(id: number): Promise<ActividadEntity | null>;  // Soft delete

  // ==================== BÚSQUEDA Y SELECTOR ====================
  /**
   * Busca actividades por descripción (autocomplete)
   * Retorna máximo 20 resultados ordenados por relevancia
   */
  searchActividades(query: string, limit?: number): Promise<ActividadCompletaEntity[]>;
  
  /**
   * Obtiene una actividad con toda su jerarquía completa
   * Para mostrar los 6 niveles al seleccionar
   */
  findActividadCompleta(ciactId: number): Promise<ActividadCompletaEntity | null>;
  
  /**
   * Obtiene una actividad completa por su código abreviado
   */
  findActividadCompletaByAbr(abr: string): Promise<ActividadCompletaEntity | null>;

  // ==================== ÁRBOL JERÁRQUICO ====================
  /**
   * Obtiene el árbol completo para navegación
   */
  findArbolCompleto(): Promise<ArbolCiiuEntity[]>;
  
  /**
   * Obtiene hijos de un nodo específico
   */
  findHijosByNivel(nivel: number, parentId: number): Promise<ArbolCiiuEntity[]>;
}

/**
 * Token para inyección de dependencias
 */
export const CIIU_REPOSITORY = Symbol('CIIU_REPOSITORY');

