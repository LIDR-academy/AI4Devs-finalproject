import { Task, TaskStatus, Team, Department, User, UserRole, PaginatedResponse, SearchParams, SortConfig, TaskFilters, CurrentProject, TeamRecommendation } from '../types';
import { taskService } from './api';
import { adaptBackendTasksResponse, adaptBackendTask, adaptFiltersToBackend, adaptBackendStats, adaptBackendUsersResponse, adaptBackendRecommendationsResponse } from './dataAdapters';
import { getTasksWithStage, getTaskStage } from './mockData/tasks';
// TODO: Reimplementar cuando esté disponible el servicio de matriz de afinidad
// import { getAffinityByTeamAndDepartment } from './mockData/affinityMatrix';
import { 
  getTeamById as getTeamByIdAdapter, 
  getDepartmentById as getDepartmentByIdAdapter
} from './dataAdapters';

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Adaptar Task a CurrentProject para mantener compatibilidad
 */
const adaptTaskToCurrentProject = async (task: Task): Promise<CurrentProject> => {
  const department = await getDepartmentByIdAdapter(task.department);
  const now = new Date();
  
  // Determinar estado basado en fechas
  let status: CurrentProject['status'] = 'doing';
  if (task.startDate && task.endDate) {
    const daysDiff = Math.ceil((task.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (now < task.startDate) {
      status = 'todo';
    } else if (daysDiff <= 7) {
      status = 'demo';
    }
  }

  return {
    id: task.id,
    name: task.subject, // Mapear subject a name
    startDate: task.startDate || new Date(),
    endDate: task.endDate || new Date(),
    status,
    loadFactor: task.loadFactor || 1,
    sprints: task.sprints, // Incluir estimación en sprints
    department: department?.name || 'Sin Departamento'
  };
};

/**
 * Obtener proyectos actuales de un equipo basado en las tareas
 * Reemplaza getCurrentProjectsByTeam de currentProjects.ts
 */
const getCurrentProjectsByTeamFromTasks = async (teamId: number): Promise<CurrentProject[]> => {
  const tasksWithStage = getTasksWithStage();
  
  // Filtrar tareas que están asignadas al equipo y en progreso o planificadas
  const teamTasks = tasksWithStage.filter(task => 
    task.team === teamId && 
    (task.status === TaskStatus.TODO || task.status === TaskStatus.DOING) &&
    task.startDate && 
    task.endDate
  );

  const projectPromises = teamTasks.map(adaptTaskToCurrentProject);
  return await Promise.all(projectPromises);
};

/**
 * Verificar conflictos de proyectos basado en tareas
 * Reemplaza getProjectConflicts de currentProjects.ts
 */
const getProjectConflictsFromTasks = async (
  teamId: number, 
  proposedStartDate: Date, 
  proposedEndDate: Date
): Promise<{ conflictingProjects: CurrentProject[]; overlapDetails: string[] }> => {
  const currentProjects = await getCurrentProjectsByTeamFromTasks(teamId);
  const conflictingProjects: CurrentProject[] = [];
  const overlapDetails: string[] = [];

  currentProjects.forEach(project => {
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);

    // Verificar solapamiento
    if (
      (proposedStartDate >= projectStart && proposedStartDate <= projectEnd) ||
      (proposedEndDate >= projectStart && proposedEndDate <= projectEnd) ||
      (proposedStartDate <= projectStart && proposedEndDate >= projectEnd)
    ) {
      conflictingProjects.push(project);
      overlapDetails.push(
        `Conflicto con "${project.name}" (${projectStart.toLocaleDateString('es-ES')} - ${projectEnd.toLocaleDateString('es-ES')})`
      );
    }
  });

  return { conflictingProjects, overlapDetails };
};

export class TaskService {
  
  /**
   * Obtener tareas con filtros, paginación y búsqueda
   */
  static async getTasks(
    filters?: TaskFilters,
    pagination?: { page: number; pageSize: number },
    search?: SearchParams,
    sort?: SortConfig,
    userRole?: UserRole,
    userDepartment?: number
  ): Promise<PaginatedResponse<Task>> {
    try {
      // Convertir filtros del frontend al formato del backend
      const backendFilters = adaptFiltersToBackend(filters || {});
      
      // Agregar búsqueda si existe
      if (search && search.query.trim()) {
        backendFilters.search = search.query.trim();
      }
      
      // Agregar ordenamiento
      if (sort) {
        backendFilters.sort_by = sort.field;
        backendFilters.sort_order = sort.direction;
      }
      
      // Agregar paginación
      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 25;
      backendFilters.offset = (page - 1) * pageSize;
      backendFilters.limit = pageSize;
      
      // Llamar al API del backend
      const response = await taskService.getTasks(backendFilters);
      
      // Adaptar la respuesta al formato del frontend
      return adaptBackendTasksResponse(response);
      
    } catch (error) {
      console.error('Error al obtener tareas del backend:', error);
      throw new Error('Error al cargar las tareas. Verifique su conexión.');
    }
  }
  
  /**
   * Obtener una tarea por ID
   */
  static async getTaskById(id: number): Promise<Task | null> {
    try {
      const response = await taskService.getTaskById(id);
      
      if (!response.success || !response.data) {
        return null;
      }
      
      return adaptBackendTask(response.data);
      
    } catch (error) {
      console.error('Error al obtener tarea del backend:', error);
      throw new Error('Error al cargar la tarea. Verifique su conexión.');
    }
  }
  
  /**
   * Obtener tareas pendientes de planificar
   */
  static async getPendingPlanningTasks(
    userRole?: UserRole,
    userDepartment?: number
  ): Promise<Task[]> {
    await delay(250);
    
    let tasks = getTasksWithStage().filter(task => 
      task.status === TaskStatus.BACKLOG
    );
    
    // Filtrar por departamento si es usuario de negocio
    if (userRole === UserRole.NEGOCIO && userDepartment) {
      tasks = tasks.filter(task => task.department === userDepartment);
    }
    
    return tasks.sort((a, b) => (a.priorityOrder || 999) - (b.priorityOrder || 999));
  }
  
  /**
   * Obtener estadísticas de tareas
   */
  static async getTaskStats(
    userRole?: UserRole,
    userDepartment?: number
  ): Promise<{
    total: number;
    byStage: Record<TaskStatus, number>;
    byStatus: Record<string, number>;
    byPriority: Record<number, number>;
  }> {
    try {
      // Intentar obtener estadísticas del backend
      const response = await taskService.getTaskStats();
      return adaptBackendStats(response);
      
    } catch (error) {
      console.error('Error al obtener estadísticas del backend:', error);
      
      // Fallback a datos mock
      let tasks = getTasksWithStage();
      
      // Filtrar por departamento si es usuario de negocio
      if (userRole === UserRole.NEGOCIO && userDepartment) {
        tasks = tasks.filter(task => task.department === userDepartment);
      }
      
      const stats = {
        total: tasks.length,
        byStage: {} as Record<TaskStatus, number>,
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<number, number>
      };
      
      // Contar por estado
      Object.values(TaskStatus).forEach(status => {
        stats.byStage[status] = tasks.filter(task => task.status === status).length;
      });
      
      // Contar por prioridad
      [1, 2, 3].forEach(priority => {
        stats.byPriority[priority] = tasks.filter(task => task.priority === priority).length;
      });
      
      return stats;
    }
  }
  
  /**
   * Aplicar filtros a las tareas
   */
  private static applyFilters(
    tasks: Task[], 
    filters: TaskFilters
  ): Task[] {
    return tasks.filter(task => {
      if (filters.department && task.department !== filters.department) return false;
      if (filters.status && task.status !== filters.status) return false;
      if (filters.team && task.team !== filters.team) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
              if (filters.status && task.status !== filters.status) return false;
      
      // Filtros booleanos
      if (filters.hasResponsible !== undefined) {
        const hasResponsible = !!task.assignedTo;
        if (filters.hasResponsible !== hasResponsible) return false;
      }
      
      if (filters.hasFunctional !== undefined) {
        const hasFunctional = !!task.functional;
        if (filters.hasFunctional !== hasFunctional) return false;
      }
      
      if (filters.hasEstimation !== undefined) {
        const hasEstimation = !!task.sprints;
        if (filters.hasEstimation !== hasEstimation) return false;
      }
      
      // Filtros de fecha
      if (filters.startDate && task.startDate && task.startDate < filters.startDate) return false;
      if (filters.endDate && task.endDate && task.endDate > filters.endDate) return false;
      
      return true;
    });
  }
  
  /**
   * Aplicar búsqueda por texto
   */
  private static applySearch(
    tasks: (Task & { stage: TaskStatus })[], 
    search: SearchParams
  ): (Task & { stage: TaskStatus })[] {
    const query = search.query.toLowerCase();
    
    return tasks.filter(task => {
      // Buscar en campos especificados o en todos por defecto
      const fieldsToSearch = search.fields.length > 0 ? search.fields : ['subject', 'description'];
      
      return fieldsToSearch.some(field => {
        const value = (task as any)[field];
        return value && value.toString().toLowerCase().includes(query);
      });
    });
  }
  
  /**
   * Aplicar ordenamiento
   */
  private static applySort(
    tasks: (Task & { stage: TaskStatus })[], 
    sort: SortConfig
  ): (Task & { stage: TaskStatus })[] {
    return [...tasks].sort((a, b) => {
      const aValue = (a as any)[sort.field];
      const bValue = (b as any)[sort.field];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }
  
  /**
   * Exportar tareas (simulado)
   */
  static async exportTasks(
    format: 'excel' | 'csv',
    filters?: TaskFilters,
    userRole?: UserRole,
    userDepartment?: number
  ): Promise<{ url: string; filename: string }> {
    await delay(1000); // Simular procesamiento
    
    // En una implementación real, aquí se generaría el archivo
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `tareas_${timestamp}.${format}`;
    
    return {
      url: `#download-${filename}`, // URL simulada
      filename
    };
  }
  
  /**
   * Actualizar estimación de una tarea
   */
  static async updateTaskEstimation(
    taskId: number,
    sprints: number,
    loadFactor: number
  ): Promise<Task & { stage: TaskStatus }> {
    try {
      // Llamar al endpoint real del backend
      const response = await taskService.updateTaskEstimation(taskId, {
        estimacion_sprints: sprints,
        factor_carga: loadFactor
      });
      
      if (!response.success || !response.data) {
        throw new Error('Error al actualizar la estimación');
      }
      
      // Adaptar la respuesta del backend al formato del frontend
      const backendTask = response.data;
      const adaptedTask = adaptBackendTask(backendTask);
      
      return {
        ...adaptedTask,
        stage: adaptedTask.status // El status ya viene adaptado del backend
      };
      
    } catch (error: any) {
      console.error('Error updating task estimation:', error);
      
      // Manejar errores específicos del backend
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      
      if (errorMessage.includes('Sin permisos')) {
        throw new Error('Sin permisos: solo usuarios de tecnología pueden estimar tareas');
      }
      
      if (errorMessage.includes('no se puede estimar')) {
        throw new Error(errorMessage);
      }
      
      if (errorMessage.includes('Tarea no encontrada')) {
        throw new Error(`Tarea con ID ${taskId} no encontrada`);
      }
      
      throw new Error('Error al actualizar la estimación. Por favor, inténtelo de nuevo.');
    }
  }

  /**
   * Obtener recomendaciones de equipos para una tarea
   */
  static async getTeamRecommendations(taskId: number): Promise<TeamRecommendation[]> {
    try {
      const response = await taskService.getRecommendations(taskId);
      
      if (!response.success || !response.data) {
        throw new Error('Error al obtener recomendaciones');
      }
      
      // Adaptar la respuesta del backend al formato del frontend
      return adaptBackendRecommendationsResponse(response);
      
    } catch (error) {
      console.error('Error al obtener recomendaciones del backend:', error);
      throw new Error('Error al cargar las recomendaciones. Verifique su conexión.');
    }
  }

  /**
   * Asignar equipo y fechas a una tarea
   */
  static async assignTeamAndDates(
    taskId: number,
    teamId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Task & { stage: TaskStatus }> {
    try {
      const response = await taskService.assignTeamAndDates(taskId, {
        equipo_id: teamId,
        fecha_inicio: startDate.toISOString().split('T')[0],
        fecha_fin: endDate.toISOString().split('T')[0]
      });
      
      if (!response.success || !response.data) {
        throw new Error('Error al asignar equipo y fechas');
      }
      
      // Adaptar la respuesta del backend al formato del frontend
      const backendTask = response.data;
      const adaptedTask = adaptBackendTask(backendTask);
      
      return {
        ...adaptedTask,
        stage: adaptedTask.status // El status ya viene adaptado del backend
      };
      
    } catch (error: any) {
      console.error('Error al asignar equipo y fechas:', error);
      
      // Manejar errores específicos del backend
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      
      if (errorMessage.includes('Sin permisos')) {
        throw new Error('Sin permisos: solo usuarios de tecnología pueden asignar equipos');
      }
      
      if (errorMessage.includes('no se puede planificar')) {
        throw new Error(errorMessage);
      }
      
      if (errorMessage.includes('Tarea no encontrada')) {
        throw new Error(`Tarea con ID ${taskId} no encontrada`);
      }
      
      if (errorMessage.includes('Equipo no encontrado')) {
        throw new Error(`Equipo con ID ${teamId} no encontrado`);
      }
      
      throw new Error('Error al asignar la tarea. Por favor, inténtelo de nuevo.');
    }
  }

  /**
   * Verificar conflictos de planificación para un equipo
   * Versión simplificada - se puede mejorar más adelante
   */
  static async checkTeamConflicts(
    teamId: number,
    startDate: Date,
    endDate: Date,
    excludeTaskId?: number
  ): Promise<{ hasConflicts: boolean; conflicts: string[]; warnings: string[] }> {
    try {
      // Por ahora, devolvemos una verificación simple
      // TODO: Implementar endpoint de verificación de conflictos en el backend
      
      const team = await getTeamByIdAdapter(teamId);
      if (!team) {
        return {
          hasConflicts: false,
          conflicts: [],
          warnings: [`Equipo ${teamId} no encontrado`]
        };
      }

      const warnings: string[] = [];

      // Verificar capacidad del equipo
      if (team.currentLoad >= team.capacity) {
        warnings.push(`El equipo ${team.name} está al máximo de su capacidad (${team.currentLoad}/${team.capacity})`);
      }

      // Verificar si es equipo externo
      if (team.isExternal) {
        warnings.push(`${team.name} es un equipo externo - considere tiempos de coordinación adicionales`);
      }

      return {
        hasConflicts: false,
        conflicts: [],
        warnings
      };
    } catch (error) {
      console.error('Error checking team conflicts:', error);
      return {
        hasConflicts: false,
        conflicts: [],
        warnings: ['Error al verificar conflictos del equipo']
      };
    }
  }

  /**
   * Calcular fechas posibles para un equipo
   */
  private static async calculatePossibleDates(
    teamId: number,
    sprints: number,
    loadFactor: number,
    plannedTasks: (Task & { stage: TaskStatus })[]
  ): Promise<{ possibleStartDate: Date; possibleEndDate: Date }> {
    const team = await getTeamByIdAdapter(teamId);
    if (!team) {
      throw new Error(`Equipo ${teamId} no encontrado`);
    }

    // Obtener la última fecha de finalización del equipo
    const teamTasks = plannedTasks.filter(t => t.team === teamId && t.endDate);
    
    let latestEndDate = new Date();
    if (teamTasks.length > 0) {
      const endDates = teamTasks.map(t => new Date(t.endDate!));
      latestEndDate = new Date(Math.max(...endDates.map(d => d.getTime())));
    }

    // Calcular fecha de inicio posible
    // Si el equipo tiene capacidad disponible, puede empezar antes
    const availableCapacity = team.capacity - team.currentLoad;
    const possibleStartDate = availableCapacity >= loadFactor 
      ? new Date() // Puede empezar ahora
      : new Date(latestEndDate.getTime() + 24 * 60 * 60 * 1000); // Día siguiente al último proyecto

    // Calcular fecha de fin (sprints * 2 semanas)
    const durationMs = sprints * 14 * 24 * 60 * 60 * 1000; // 14 días por sprint
    const possibleEndDate = new Date(possibleStartDate.getTime() + durationMs);

    return { possibleStartDate, possibleEndDate };
  }

  /**
   * Calcular puntuación de recomendación
   */
  private static calculateRecommendationScore(
    affinity: number,
    availableCapacity: number,
    totalCapacity: number,
    possibleStartDate: Date,
    isExternal: boolean
  ): number {
    let score = 0;

    // Factor de afinidad (40% del peso)
    score += (affinity / 5) * 40;

    // Factor de disponibilidad (35% del peso)
    const capacityRatio = availableCapacity / totalCapacity;
    score += capacityRatio * 35;

    // Factor de tiempo (15% del peso) - cuanto antes pueda empezar, mejor
    const today = new Date();
    const daysUntilStart = Math.max(0, (possibleStartDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    const timeScore = Math.max(0, 15 - (daysUntilStart / 7)); // Menos puntos por cada semana de retraso
    score += timeScore;

    // Penalización por equipos externos (10% del peso)
    if (!isExternal) {
      score += 10; // Bonus por equipo interno
    }

    return Math.round(score * 10) / 10; // Redondear a 1 decimal
  }
} 