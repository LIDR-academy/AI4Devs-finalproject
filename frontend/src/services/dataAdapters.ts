import { Task, TaskStatus, Team, Department, User, CurrentProject, TeamRecommendation } from '../types';

/**
 * Adaptador para convertir datos del backend al formato esperado por el frontend
 */

// Mapeo de estados de Redmine a nuestros estados
// Los estados reales de Redmine son: "Backlog", "To Do", "Doing", "Demo", "Done"
const STATUS_MAPPING: Record<string, TaskStatus> = {
  'Backlog': TaskStatus.BACKLOG,
  'To Do': TaskStatus.TODO,    // Corregido: "To Do" con mayúsculas
  'Doing': TaskStatus.DOING,
  'Demo': TaskStatus.DEMO,
  'Done': TaskStatus.DONE,
};

// Mapeo de etapas del backend a nuestros estados
const STAGE_MAPPING: Record<string, TaskStatus> = {
  'sin_planificar': TaskStatus.BACKLOG,
  'planificada': TaskStatus.TODO,
  'en_curso': TaskStatus.DOING,
  'finalizada': TaskStatus.DONE,
};

/**
 * Convierte una tarea del backend al formato del frontend
 */
export const adaptBackendTask = (backendTask: any): Task => {
  // Debug para entender qué status viene del backend
  console.log(`🔍 adaptBackendTask for task ${backendTask.id}:`, {
    raw_status: backendTask.status,
    status_type: typeof backendTask.status,
    status_name: backendTask.status?.name,
    etapa: backendTask.etapa
  });
  
  // Determinar el status basado en el estado de Redmine (PRIORIDAD 1)
  let status = TaskStatus.BACKLOG;
  if (backendTask.status?.name) {
    status = STATUS_MAPPING[backendTask.status.name] || TaskStatus.BACKLOG;
    console.log(`🔄 Status mapped from status.name: "${backendTask.status.name}" → ${status}`);
  } else if (typeof backendTask.status === 'string') {
    // Si el backend ya envía un string directamente
    status = STATUS_MAPPING[backendTask.status] || TaskStatus.BACKLOG;
    console.log(`🔄 Status mapped from string: "${backendTask.status}" → ${status}`);
  } else if (backendTask.etapa) {
    // Solo usar etapa como fallback si no hay status de Redmine
    status = STAGE_MAPPING[backendTask.etapa] || TaskStatus.BACKLOG;
    console.log(`🔄 Status fallback from etapa: "${backendTask.etapa}" → ${status}`);
  }
  
  console.log(`✅ Final status for task ${backendTask.id}: ${status}`);

  // Si no tiene etapa del backend, calcularlo basado en los datos
  if (!backendTask.etapa) {
    if (status === TaskStatus.DONE) {
      status = TaskStatus.DONE;
    } else if (status === TaskStatus.DOING) {
      status = TaskStatus.DOING;
    } else if (backendTask.equipo_asignado && backendTask.fecha_inicio_planificada && backendTask.fecha_fin_planificada) {
      status = TaskStatus.TODO;
    } else if (backendTask.tiene_responsable && backendTask.tiene_funcional && backendTask.estimacion_sprints) {
      status = TaskStatus.TODO;
    } else {
      status = TaskStatus.BACKLOG;
    }
  }

  return {
    id: backendTask.id,
    subject: backendTask.subject || '',
    description: backendTask.description || '',
    status,
    priority: backendTask.priority?.id || 1,
    assignedTo: backendTask.assigned_to?.id,
    assignedToName: backendTask.assigned_to?.name || (backendTask.assigned_to?.firstname && backendTask.assigned_to?.lastname 
      ? `${backendTask.assigned_to.firstname} ${backendTask.assigned_to.lastname}`.trim()
      : undefined),
    functional: backendTask.funcional,
    department: backendTask.departamento_id || 1, // Usar ID real del backend o default
    departmentName: backendTask.departamento_nombre || backendTask.departamento,
    createdAt: new Date(backendTask.created_on || Date.now()),
    updatedAt: new Date(backendTask.updated_on || Date.now()),
    sprints: backendTask.estimacion_sprints,
    loadFactor: backendTask.factor_carga,
    team: backendTask.equipo_asignado?.id,
    startDate: backendTask.fecha_inicio_planificada ? new Date(backendTask.fecha_inicio_planificada) : undefined,
    endDate: backendTask.fecha_fin_planificada ? new Date(backendTask.fecha_fin_planificada) : undefined,
    priorityOrder: backendTask.orden_prioridad,
  };
};

/**
 * Convierte la respuesta de tareas del backend al formato del frontend
 */
export const adaptBackendTasksResponse = (backendResponse: any) => {
  if (!backendResponse.success || !backendResponse.data) {
    throw new Error('Respuesta inválida del servidor');
  }

  const backendData = backendResponse.data;
  
  // Debug log para identificar el problema
  console.log('🔍 adaptBackendTasksResponse received:', {
    data: backendData,
    tasks: Array.isArray(backendData.tasks) ? `Array[${backendData.tasks.length}]` : backendData.tasks,
    pagination: backendData.pagination
  });
  
  // La estructura del backend puede ser { tasks: [], pagination: { total, offset, limit, ... } }
  const tasks = backendData.tasks || backendData;
  const pagination = backendData.pagination || {};
  
  // Priorizar datos de pagination, luego fallback a nivel raíz
  const totalCount = pagination.total || backendData.total_count || backendData.totalCount || tasks.length;
  const offset = pagination.offset || backendData.offset || 0;
  const limit = pagination.limit || backendData.limit || 25; // Default 25 en lugar de tasks.length
  
  return {
    data: tasks.map(adaptBackendTask),
    pagination: {
      currentPage: Math.floor(offset / limit) + 1,
      pageSize: limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * Convierte un usuario del backend al formato del frontend
 */
export const adaptBackendUser = (backendUser: any): User => {
  return {
    id: backendUser.id,
    username: backendUser.login || backendUser.username || '',
    name: `${backendUser.firstname || ''} ${backendUser.lastname || ''}`.trim() || backendUser.name || '',
    email: backendUser.mail || backendUser.email || '',
    role: backendUser.role || 'NEGOCIO', // Por defecto, se puede mapear según la lógica de negocio
    department: backendUser.department_id
  };
};

/**
 * Convierte la respuesta de usuarios del backend al formato del frontend
 */
export const adaptBackendUsersResponse = (backendResponse: any) => {
  if (!backendResponse.success || !backendResponse.data) {
    throw new Error('Respuesta inválida del servidor');
  }

  const users = backendResponse.data.users || backendResponse.data;
  return users.map(adaptBackendUser);
};

/**
 * Convierte estadísticas del backend al formato del frontend
 */
export const adaptBackendStats = (backendResponse: any) => {
  if (!backendResponse.success || !backendResponse.data) {
    throw new Error('Respuesta inválida del servidor');
  }

  const stats = backendResponse.data;
  
  return {
    total: stats.total_tareas || 0,
    byStage: {
      [TaskStatus.BACKLOG]: stats.por_etapa?.sin_planificar || 0,
      [TaskStatus.TODO]: stats.por_etapa?.planificada || 0,
      [TaskStatus.DOING]: stats.por_etapa?.en_curso || 0,
      [TaskStatus.DEMO]: 0, // No hay mapeo directo del backend
      [TaskStatus.DONE]: stats.por_etapa?.finalizada || 0,
    },
    byStatus: stats.por_estado || {},
    byPriority: stats.por_prioridad || {},
  };
};

/**
 * Convierte filtros del frontend al formato del backend
 */
export const adaptFiltersToBackend = (frontendFilters: any) => {
  const backendFilters: any = {};

  // Mapear filtros comunes
  if (frontendFilters.department) {
    // Enviar directamente el ID del departamento
    backendFilters.departamento = frontendFilters.department.toString();
  }

  if (frontendFilters.status) {
    // Mapear nuestros estados a estados de Redmine (enviar nombre, no ID)
    // Priorizar los nombres reales de Redmine
    const statusMapping: Record<string, string> = {
      [TaskStatus.BACKLOG]: 'Backlog',
      [TaskStatus.TODO]: 'To Do',    // Corregido: "To Do" con mayúsculas
      [TaskStatus.DOING]: 'Doing',
      [TaskStatus.DEMO]: 'Demo',
      [TaskStatus.DONE]: 'Done'
    };
    
    const redmineStatusName = statusMapping[frontendFilters.status];
    if (redmineStatusName) {
      backendFilters.status_id = redmineStatusName;
      console.log(`🔍 Status filter mapped: ${frontendFilters.status} → ${redmineStatusName}`);
    }
  }

  if (frontendFilters.stage) {
    // Mapear nuestras etapas a etapas del backend
    const backendStage = Object.entries(STAGE_MAPPING).find(([backendSt, ourStage]) => 
      ourStage === frontendFilters.stage
    );
    if (backendStage) {
      backendFilters.etapa = backendStage[0];
    }
  }

  if (frontendFilters.team) {
    backendFilters.equipo_id = frontendFilters.team;
  }

  if (frontendFilters.priority) {
    backendFilters.priority_id = frontendFilters.priority;
  }

  if (frontendFilters.startDate) {
    backendFilters.fecha_inicio_desde = frontendFilters.startDate.toISOString().split('T')[0];
  }

  if (frontendFilters.endDate) {
    backendFilters.fecha_fin_hasta = frontendFilters.endDate.toISOString().split('T')[0];
  }

  return backendFilters;
};

/**
 * Convierte un equipo del backend al formato del frontend
 */
export const adaptBackendTeam = (backendTeam: any): Team => {
  return {
    id: backendTeam.id,
    name: backendTeam.nombre,
    capacity: backendTeam.capacidad || 0,
    currentLoad: 0, // Se calculará dinámicamente
    isExternal: backendTeam.tipo === 'EXTERNO'
  };
};

/**
 * Convierte un departamento del backend al formato del frontend
 */
export const adaptBackendDepartment = (backendDepartment: any): Department => {
  return {
    id: backendDepartment.id,
    name: backendDepartment.nombre
  };
};

/**
 * Adapta la respuesta de equipos del backend
 */
export const adaptBackendTeamsResponse = (backendResponse: any): Team[] => {
  if (!backendResponse.success || !backendResponse.data) {
    console.warn('Invalid teams response format:', backendResponse);
    return [];
  }
  
  // La respuesta del backend tiene la estructura: { data: { equipos: [...], pagination: {...} } }
  const equipos = backendResponse.data.equipos || backendResponse.data;
  
  if (!Array.isArray(equipos)) {
    console.warn('Equipos is not an array:', equipos);
    return [];
  }
  
  return equipos.map(adaptBackendTeam);
};

/**
 * Adapta la respuesta de departamentos del backend
 */
export const adaptBackendDepartmentsResponse = (backendResponse: any): Department[] => {
  if (!backendResponse.success || !backendResponse.data) {
    console.warn('Invalid departments response format:', backendResponse);
    return [];
  }
  
  // La respuesta del backend tiene la estructura: { data: { departamentos: [...], pagination: {...} } }
  const departamentos = backendResponse.data.departamentos || backendResponse.data;
  
  if (!Array.isArray(departamentos)) {
    console.warn('Departamentos is not an array:', departamentos);
    return [];
  }
  
  return departamentos.map(adaptBackendDepartment);
};

/**
 * Calcula la carga actual de un equipo basándose en las tareas asignadas
 */
export const calculateTeamCurrentLoad = (tasks: any[], teamId: number): number => {
  const teamTasks = tasks.filter((task: any) => {
    // Verificar si es una tarea del formato mock o del formato backend
    const taskTeamId = task.team || task.equipo_id;
    const taskStatus = task.status || task.etapa;
    
    // Solo contar tareas que están asignadas al equipo y están activas
    const isTeamMatch = taskTeamId === teamId;
    const isActiveStatus = (
      taskStatus === TaskStatus.TODO || 
      taskStatus === TaskStatus.DOING ||
      taskStatus === 'planificada' ||
      taskStatus === 'en_curso' ||
      taskStatus === 'Doing' ||
      taskStatus === 'To Do'
    );
    
    return isTeamMatch && isActiveStatus;
  });
  
  const totalLoad = teamTasks.reduce((sum: number, task: any) => {
    // Verificar si es formato mock o backend
    const loadFactor = task.factor_carga || task.loadFactor || 1;
    return sum + loadFactor;
  }, 0);
  
  return totalLoad;
};

/**
 * Actualiza la carga actual de los equipos basándose en las tareas
 */
export const updateTeamsWithCurrentLoad = (teams: Team[], tasks: any[]): Team[] => {
  return teams.map(team => ({
    ...team,
    currentLoad: calculateTeamCurrentLoad(tasks, team.id)
  }));
};

// Cache para equipos y departamentos
let teamsCache: Team[] = [];
let departmentsCache: Department[] = [];
let teamsCacheTime = 0;
let departmentsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene el nombre de un equipo por ID (con cache)
 */
export const getTeamNameById = async (teamId: number): Promise<string> => {
  try {
    // Verificar cache
    const now = Date.now();
    if (teamsCache.length === 0 || (now - teamsCacheTime) > CACHE_DURATION) {
      const { teamService } = await import('./api');
      const response = await teamService.getTeams();
      teamsCache = adaptBackendTeamsResponse(response);
      teamsCacheTime = now;
    }

    const team = teamsCache.find(t => t.id === teamId);
    return team?.name || 'Sin Equipo';
  } catch (error) {
    console.error('Error getting team name:', error);
    return 'Sin Equipo';
  }
};

/**
 * Obtiene el nombre de un departamento por ID (con cache)
 */
export const getDepartmentNameById = async (departmentId: number): Promise<string> => {
  try {
    // Verificar cache
    const now = Date.now();
    if (departmentsCache.length === 0 || (now - departmentsCacheTime) > CACHE_DURATION) {
      const { departmentService } = await import('./api');
      const response = await departmentService.getDepartments();
      departmentsCache = adaptBackendDepartmentsResponse(response);
      departmentsCacheTime = now;
    }

    const department = departmentsCache.find(d => d.id === departmentId);
    return department?.name || 'Sin Departamento';
  } catch (error) {
    console.error('Error getting department name:', error);
    return 'Sin Departamento';
  }
};

/**
 * Obtiene un equipo por ID (con cache)
 */
export const getTeamById = async (teamId: number): Promise<Team | null> => {
  try {
    // Verificar cache
    const now = Date.now();
    if (teamsCache.length === 0 || (now - teamsCacheTime) > CACHE_DURATION) {
      const { teamService } = await import('./api');
      const response = await teamService.getTeams();
      teamsCache = adaptBackendTeamsResponse(response);
      teamsCacheTime = now;
    }

    return teamsCache.find(t => t.id === teamId) || null;
  } catch (error) {
    console.error('Error getting team:', error);
    return null;
  }
};

/**
 * Obtiene un departamento por ID (con cache)
 */
export const getDepartmentById = async (departmentId: number): Promise<Department | null> => {
  try {
    // Verificar cache
    const now = Date.now();
    if (departmentsCache.length === 0 || (now - departmentsCacheTime) > CACHE_DURATION) {
      const { departmentService } = await import('./api');
      const response = await departmentService.getDepartments();
      departmentsCache = adaptBackendDepartmentsResponse(response);
      departmentsCacheTime = now;
    }

    return departmentsCache.find(d => d.id === departmentId) || null;
  } catch (error) {
    console.error('Error getting department:', error);
    return null;
  }
};

/**
 * Limpia el cache de equipos y departamentos
 */
export const clearTeamsAndDepartmentsCache = () => {
  teamsCache = [];
  departmentsCache = [];
  teamsCacheTime = 0;
  departmentsCacheTime = 0;
};

/**
 * Obtiene todos los equipos con carga actual calculada
 */
export const getAllTeamsWithCurrentLoad = async (): Promise<Team[]> => {
  try {
    const { teamService, taskService } = await import('./api');
    
    // Obtener equipos del backend
    const [teamsResponse, tasksResponse] = await Promise.all([
      teamService.getTeams(),
      taskService.getTasks({
        etapa: 'en_curso,planificada', // Solo tareas activas
        limit: 1000 // Obtener todas las tareas activas
      })
    ]);

    const teams = adaptBackendTeamsResponse(teamsResponse);
    
    // Procesar tareas del backend
    let tasks: any[] = [];
    if (tasksResponse.success && tasksResponse.data) {
      const backendTasks = tasksResponse.data.tasks || tasksResponse.data;
      tasks = backendTasks
        .filter((task: any) => task.equipo_id && task.factor_carga) // Solo tareas con equipo y factor de carga
        .map((task: any) => ({
          id: task.id,
          team: task.equipo_id,
          loadFactor: task.factor_carga || 1,
          status: task.etapa || task.status,
          subject: task.subject
        }));
    }
    
    return updateTeamsWithCurrentLoad(teams, tasks);
  } catch (error) {
    console.error('Error getting teams with current load:', error);
    
    // Fallback: usar solo datos de equipos sin carga calculada
    try {
      const { teamService } = await import('./api');
      const teamsResponse = await teamService.getTeams();
      const teams = adaptBackendTeamsResponse(teamsResponse);
      return teams.map(team => ({ ...team, currentLoad: 0 }));
    } catch (fallbackError) {
      console.error('Error in fallback:', fallbackError);
      return [];
    }
  }
};

/**
 * Adapta un proyecto actual del backend al formato del frontend
 */
export const adaptBackendCurrentProject = (backendProject: any): CurrentProject => {
  return {
    id: backendProject.id,
    name: backendProject.name,
    startDate: new Date(backendProject.startDate),
    endDate: new Date(backendProject.endDate),
    status: backendProject.status,
    loadFactor: backendProject.loadFactor || 1,
    sprints: backendProject.sprints,
    department: backendProject.department || 'Sin Departamento'
  };
};

/**
 * Adapta una recomendación de equipo del backend al formato del frontend
 */
export const adaptBackendTeamRecommendation = (backendRecommendation: any): TeamRecommendation => {
  return {
    teamId: backendRecommendation.teamId,
    teamName: backendRecommendation.teamName,
    isExternal: backendRecommendation.isExternal,
    currentLoad: backendRecommendation.currentLoad,
    capacity: backendRecommendation.capacity,
    affinity: backendRecommendation.affinity,
    possibleStartDate: backendRecommendation.possibleStartDate,
    possibleEndDate: backendRecommendation.possibleEndDate,
    recommendationScore: backendRecommendation.recommendationScore,
    currentProjects: (backendRecommendation.currentProjects || []).map(adaptBackendCurrentProject)
  };
};

/**
 * Adapta la respuesta de recomendaciones del backend
 */
export const adaptBackendRecommendationsResponse = (backendResponse: any): TeamRecommendation[] => {
  if (!backendResponse.success || !backendResponse.data) {
    console.warn('Invalid recommendations response format:', backendResponse);
    return [];
  }
  
  const recommendations = backendResponse.data;
  
  if (!Array.isArray(recommendations)) {
    console.warn('Recommendations is not an array:', recommendations);
    return [];
  }
  
  return recommendations.map(adaptBackendTeamRecommendation);
}; 