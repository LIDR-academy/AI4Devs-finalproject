// Tipos de usuario
export enum UserRole {
  NEGOCIO = 'NEGOCIO',
  TECNOLOGIA = 'TECNOLOGIA',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  username?: string; // Opcional, se puede usar email como username
  name: string;
  email: string;
  role: UserRole;
  department?: number; // ID del departamento (solo para usuarios de negocio)
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos para tareas - Estados unificados (coinciden con Redmine)
export enum TaskStatus {
  BACKLOG = 'Backlog',
  TODO = 'To Do',
  DOING = 'Doing', 
  DEMO = 'Demo',
  DONE = 'Done'
}

export interface Task {
  id: number;
  subject: string;
  description: string;
  status: TaskStatus;
  priority: number;
  assignedTo?: number; // ID del usuario responsable
  assignedToName?: string; // Nombre del usuario responsable
  functional?: string; // Documento funcional
  department: number; // ID del departamento
  departmentName?: string; // Nombre del departamento
  createdAt: Date;
  updatedAt: Date;
  // Campos extendidos que no están en Redmine
  sprints?: number; // Estimación en sprints
  loadFactor?: number; // Factor de carga (1-5)
  team?: number; // ID del equipo asignado
  startDate?: Date; // Fecha de inicio planificada
  endDate?: Date; // Fecha de fin planificada
  priorityOrder?: number; // Orden de prioridad en el backlog
}

// Tipos para equipos
export interface Team {
  id: number;
  name: string;
  capacity: number; // Capacidad total del equipo
  currentLoad: number; // Carga actual del equipo
  isExternal: boolean; // Si es un equipo externo o interno
}

// Tipos para departamentos
export interface Department {
  id: number;
  name: string;
}

// Matriz de afinidad
export interface AffinityMatrix {
  id: number;
  teamId: number;
  departmentId: number;
  affinityLevel: number; // Nivel de afinidad (1-5)
}

// Tipo para proyectos actuales del equipo
// NOTA: Esta interfaz es una representación adaptada de Task para mostrar proyectos actuales
// Los datos reales provienen de Task y se adaptan dinámicamente en taskService.ts
export interface CurrentProject {
  id: number;
  name: string; // Mapea a Task.subject
  startDate: Date;
  endDate: Date;
  status: 'doing' | 'demo' | 'todo';
  loadFactor: number; // Factor de carga que consume del equipo
  sprints?: number; // Estimación en sprints de la tarea original
  department: string; // Nombre del departamento (Task.department se convierte a string)
}

// Tipo para recomendaciones
export interface TeamRecommendation {
  teamId: number;
  teamName: string;
  isExternal: boolean; // Si es equipo externo o interno
  currentLoad: number;
  capacity: number; // Capacidad total del equipo
  affinity: number;
  possibleStartDate: Date | string;
  possibleEndDate: Date | string;
  recommendationScore: number; // Puntuación global de la recomendación
  score?: number; // Alias para compatibilidad (mapeará a recommendationScore)
  currentProjects: CurrentProject[]; // Proyectos actuales del equipo (adaptados de Task)
}

// Tipos para alertas
export enum AlertType {
  APPROACHING_DEADLINE = 'approaching_deadline',
  OVERDUE_TASK = 'overdue_task',
  UNASSIGNED_TASK = 'unassigned_task',
  HIGH_LOAD = 'high_load'
}

export interface Alert {
  id: number;
  type: AlertType;
  taskId?: number;
  teamId?: number;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

// Tipos para filtros de tareas
export interface TaskFilters {
  department?: number;
  status?: TaskStatus;
  team?: number;
  priority?: number;
  startDate?: Date;
  endDate?: Date;
  hasResponsible?: boolean;
  hasFunctional?: boolean;
  hasEstimation?: boolean;
}

// Tipos para paginación
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Tipos para búsqueda
export interface SearchParams {
  query: string;
  fields: string[]; // campos en los que buscar
}

// Tipos para exportación
export enum ExportFormat {
  EXCEL = 'excel',
  CSV = 'csv'
}

export interface ExportRequest {
  format: ExportFormat;
  filters?: TaskFilters;
  columns: string[];
  filename?: string;
}

// Tipos para configuración de filtros guardados
export interface SavedFilterConfig {
  id: string;
  name: string;
  filters: TaskFilters;
  userId: number;
  isDefault?: boolean;
  createdAt: Date;
}

// Tipos para ordenamiento
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Tipos para capacidad de equipos (US-10)
export interface TeamCapacity {
  id: number;
  nombre: string;
  tipo: 'INTERNO' | 'EXTERNO';
  capacidadTotal: number;
  cargaActual: number;
  disponibilidad: number;
  porcentajeOcupacion: number;
  estadoSobrecarga: 'normal' | 'advertencia' | 'critico';
  proximaFechaDisponible: Date;
  totalTareasAsignadas: number;
  tareasActuales: TeamTask[];
}

export interface TeamTask {
  id: number;
  redmineTaskId: number;
  factorCarga: number;
  estimacionSprints: number;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  fechaAsignacion: Date;
}

export interface TeamCapacityStats {
  totalEquipos: number;
  equiposSobrecargados: number;
  equiposEnAdvertencia: number;
  equiposDisponibles: number;
  capacidadTotalSistema: number;
  cargaTotalSistema: number;
}

export interface TeamCapacityResponse {
  equipos: TeamCapacity[];
  estadisticas: TeamCapacityStats;
  fechaConsulta: Date;
  periodoAnalisis: {
    desde: Date;
    hasta: Date;
  };
} 