export const CiiuEnum = {
  // Tablas
  table: {
    cisec: "rrfcisec",
    cidiv: "rrfcidiv",
    cigru: "rrfcigru",
    cicla: "rrfcicla",
    cisub: "rrfcisub",
    ciact: "rrfciact",
  },
  // Títulos
  title: {
    cisec: "Sección",
    cidiv: "División",
    cigru: "Grupo",
    cicla: "Clase",
    cisub: "Subclase",
    ciact: "Actividad",
  },
  // Servicio NATS
  msService: "msCiiu",
  
  // ==================== SECCIONES (Nivel 1) ====================
  smFindAllSecciones: "findAllSecciones",
  smFindSeccionById: "findSeccionById",
  smFindSeccionByAbr: "findSeccionByAbr",
  smCreateSeccion: "createSeccion",
  smUpdateSeccion: "updateSeccion",
  smDeleteSeccion: "deleteSeccion",
  
  // ==================== DIVISIONES (Nivel 2) ====================
  smFindAllDivisiones: "findAllDivisiones",
  smFindDivisionesBySeccion: "findDivisionesBySeccion",
  smFindDivisionById: "findDivisionById",
  smCreateDivision: "createDivision",
  smUpdateDivision: "updateDivision",
  smDeleteDivision: "deleteDivision",
  
  // ==================== GRUPOS (Nivel 3) ====================
  smFindAllGrupos: "findAllGrupos",
  smFindGruposByDivision: "findGruposByDivision",
  smFindGrupoById: "findGrupoById",
  smCreateGrupo: "createGrupo",
  smUpdateGrupo: "updateGrupo",
  smDeleteGrupo: "deleteGrupo",
  
  // ==================== CLASES (Nivel 4) ====================
  smFindAllClases: "findAllClases",
  smFindClasesByGrupo: "findClasesByGrupo",
  smFindClaseById: "findClaseById",
  smCreateClase: "createClase",
  smUpdateClase: "updateClase",
  smDeleteClase: "deleteClase",
  
  // ==================== SUBCLASES (Nivel 5) ====================
  smFindAllSubclases: "findAllSubclases",
  smFindSubclasesByClase: "findSubclasesByClase",
  smFindSubclaseById: "findSubclaseById",
  smCreateSubclase: "createSubclase",
  smUpdateSubclase: "updateSubclase",
  smDeleteSubclase: "deleteSubclase",
  
  // ==================== ACTIVIDADES (Nivel 6) ====================
  smFindAllActividades: "findAllActividades",
  smFindActividadesBySubclase: "findActividadesBySubclase",
  smFindActividadById: "findActividadById",
  smCreateActividad: "createActividad",
  smUpdateActividad: "updateActividad",
  smDeleteActividad: "deleteActividad",
  
  // ==================== BÚSQUEDA Y SELECTOR ====================
  smSearchActividades: "searchActividades",
  smFindActividadCompleta: "findActividadCompleta",
  smFindActividadCompletaByAbr: "findActividadCompletaByAbr",
  
  // ==================== ÁRBOL JERÁRQUICO ====================
  smFindArbolCompleto: "findArbolCompleto",
  smFindHijosByNivel: "findHijosByNivel",
}

