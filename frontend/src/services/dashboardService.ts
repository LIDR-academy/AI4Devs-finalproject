import { getTasksWithStage } from './mockData/tasks';
// TODO: Reemplazar con servicios reales cuando estén implementados
// import { getAllTeamsWithCurrentLoad } from './mockData/teams';
// import { mockDepartments, getDepartmentName } from './mockData/departments';
import { TaskStatus, Alert, AlertType } from '../types';
import { TaskService } from './taskService';
import { userService, teamService, departmentService, taskService } from './api';
import { 
  adaptBackendUsersResponse, 
  adaptBackendTeamsResponse, 
  adaptBackendDepartmentsResponse,
  updateTeamsWithCurrentLoad,
  calculateTeamCurrentLoad
} from './dataAdapters';

export interface DashboardMetrics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  criticalAlerts: number;
  teamUtilization: number;
  departmentDistribution: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  alerts: Alert[];
}

/**
 * Obtener tareas reales del backend para calcular carga de equipos
 */
const getRealTasksForTeamLoad = async () => {
  try {
    // Obtener todas las tareas del backend (el filtro de etapa no funciona correctamente)
    const response = await taskService.getTasks({
      limit: 1000
    });
    
    if (!response.success || !response.data) {
      console.warn('No se pudieron obtener tareas del backend');
      return [];
    }
    
    const allTasks = response.data.tasks || response.data;
    
    // Filtrar manualmente las tareas que tienen equipo asignado y están en etapas activas
    const activeTasks = allTasks.filter((task: any) => 
      task.equipo_asignado && 
      task.equipo_asignado.id &&
      (task.etapa === 'en_curso' || task.etapa === 'planificada')
    );
    
    // Procesar y adaptar las tareas para el cálculo de carga
    const processedTasks = activeTasks.map((task: any) => ({
      id: task.id,
      team: task.equipo_asignado.id, // Para compatibilidad con calculateTeamCurrentLoad
      equipo_id: task.equipo_asignado.id, // Campo del backend
      status: mapBackendStatusToFrontend(task.status),
      etapa: task.etapa,
      loadFactor: task.factor_carga || 1, // Para compatibilidad con calculateTeamCurrentLoad
      factor_carga: task.factor_carga || 1, // Campo del backend
      subject: task.subject,
      equipo_asignado: task.equipo_asignado
    }));
    
    return processedTasks;
    
  } catch (error) {
    console.error('Error al obtener tareas del backend:', error);
    return [];
  }
};

/**
 * Mapear estados del backend al formato del frontend
 */
const mapBackendStatusToFrontend = (backendStatus: string): TaskStatus => {
  const statusMap: Record<string, TaskStatus> = {
    'Backlog': TaskStatus.BACKLOG,
    'To Do': TaskStatus.TODO,
    'Doing': TaskStatus.DOING,
    'Demo': TaskStatus.DEMO,
    'Done': TaskStatus.DONE,
    'sin_planificar': TaskStatus.BACKLOG,
    'planificada': TaskStatus.TODO,
    'en_curso': TaskStatus.DOING,
    'finalizada': TaskStatus.DONE
  };
  
  return statusMap[backendStatus] || TaskStatus.BACKLOG;
};

/**
 * Calcular métricas del dashboard basándose en los datos reales del backend
 */
export const calculateDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    // Obtener estadísticas reales del backend
    const stats = await TaskService.getTaskStats();
    
    // Obtener datos reales de equipos y departamentos
    const [teamsResponse, departmentsResponse] = await Promise.all([
      teamService.getTeams(),
      departmentService.getDepartments()
    ]);

    const teams = adaptBackendTeamsResponse(teamsResponse);
    const departments = adaptBackendDepartmentsResponse(departmentsResponse);
    
    // Obtener tareas REALES del backend para calcular carga de equipos
    const realTasks = await getRealTasksForTeamLoad();
    const teamsWithLoad = updateTeamsWithCurrentLoad(teams, realTasks);

    // Métricas básicas de tareas del backend
    const totalTasks = stats.total;
    const pendingTasks = (stats.byStage?.[TaskStatus.BACKLOG] || 0) + (stats.byStage?.[TaskStatus.TODO] || 0);
    const inProgressTasks = stats.byStage?.[TaskStatus.DOING] || 0;
    const completedTasks = (stats.byStage?.[TaskStatus.DEMO] || 0) + (stats.byStage?.[TaskStatus.DONE] || 0);

    // Calcular utilización promedio de equipos
    const teamUtilization = calculateAverageTeamUtilization(teamsWithLoad);

    // Distribución por departamento basada en tareas reales
    const departmentDistribution = calculateDepartmentDistribution(realTasks, departments);

    // Generar alertas críticas
    const alerts = await generateCriticalAlerts(teamsWithLoad, realTasks);

    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      criticalAlerts: alerts.length,
      teamUtilization,
      departmentDistribution,
      alerts
    };
  } catch (error) {
    console.error('Error calculating dashboard metrics:', error);
    
    // Fallback a datos básicos en caso de error
    const stats = await TaskService.getTaskStats();
    return {
      totalTasks: stats.total || 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      criticalAlerts: 0,
      teamUtilization: 0,
      departmentDistribution: [],
      alerts: []
    };
  }
};

/**
 * Calcular utilización promedio de equipos
 */
const calculateAverageTeamUtilization = (teams: any[]): number => {
  if (teams.length === 0) return 0;
  
  const totalUtilization = teams.reduce((sum, team) => {
    const utilization = team.capacity > 0 ? (team.currentLoad / team.capacity) * 100 : 0;
    return sum + Math.min(utilization, 100); // Cap at 100%
  }, 0);
  
  return Math.round(totalUtilization / teams.length);
};

/**
 * Calcular distribución de tareas por departamento
 */
const calculateDepartmentDistribution = (tasks: any[], departments: any[]) => {
  if (!tasks || tasks.length === 0) return [];
  
  // Contar tareas por departamento
  const departmentCounts: Record<number, number> = {};
  
  tasks.forEach(task => {
    if (task.department) {
      departmentCounts[task.department] = (departmentCounts[task.department] || 0) + 1;
    }
  });
  
  // Crear distribución con porcentajes
  const totalTasks = tasks.length;
  
  return departments
    .map(dept => ({
      department: dept.name,
      count: departmentCounts[dept.id] || 0,
      percentage: totalTasks > 0 ? Math.round(((departmentCounts[dept.id] || 0) / totalTasks) * 100) : 0
    }))
    .filter(dept => dept.count > 0) // Solo mostrar departamentos con tareas
    .sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente
};

/**
 * Generar alertas críticas basadas en datos reales
 */
const generateCriticalAlerts = async (teams: any[], tasks: any[]): Promise<Alert[]> => {
  const alerts: Alert[] = [];
  const now = new Date();

  // Alertas de equipos con alta carga
  teams.forEach(team => {
    if (team.capacity > 0) {
      const utilizationPercent = (team.currentLoad / team.capacity) * 100;
      if (utilizationPercent > 90) {
        alerts.push({
          id: Date.now() + team.id,
          type: AlertType.HIGH_LOAD,
          teamId: team.id,
          message: `El equipo ${team.name} tiene una carga del ${Math.round(utilizationPercent)}%`,
          createdAt: now,
          isRead: false
        });
      }
    }
  });

  // Alertas de tareas próximas a vencer
  tasks.forEach(task => {
    if (task.endDate && task.status !== TaskStatus.DONE) {
      const daysUntilDeadline = Math.ceil((task.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline < 0) {
        alerts.push({
          id: Date.now() + task.id + 1000,
          type: AlertType.OVERDUE_TASK,
          taskId: task.id,
          message: `La tarea "${task.subject}" está vencida`,
          createdAt: now,
          isRead: false
        });
      } else if (daysUntilDeadline <= 3) {
        alerts.push({
          id: Date.now() + task.id + 2000,
          type: AlertType.APPROACHING_DEADLINE,
          taskId: task.id,
          message: `La tarea "${task.subject}" vence en ${daysUntilDeadline} días`,
          createdAt: now,
          isRead: false
        });
      }
    }

    // Alertas de tareas sin asignar a equipo
    if (!task.team) {
      alerts.push({
        id: Date.now() + task.id + 3000,
        type: AlertType.UNASSIGNED_TASK,
        taskId: task.id,
        message: `La tarea "${task.subject}" no tiene equipo asignado`,
        createdAt: now,
        isRead: false
      });
    }
  });

  return alerts.slice(0, 10); // Limitar a 10 alertas más críticas
};

/**
 * Obtener tareas próximas a vencer (en los próximos 7 días)
 * TODO: Reimplementar cuando el servicio de departamentos esté listo
 */
export const getUpcomingDeadlines = () => {
  // Temporalmente deshabilitado
  return [];
};

/**
 * Obtener todos los equipos con carga actual calculada
 */
export const getAllTeamsWithCurrentLoad = async () => {
  try {
    const [teamsResponse, realTasks] = await Promise.all([
      teamService.getTeams(),
      getRealTasksForTeamLoad() // Usar tareas reales en lugar de mock
    ]);

    const teams = adaptBackendTeamsResponse(teamsResponse);
    return updateTeamsWithCurrentLoad(teams, realTasks);
  } catch (error) {
    console.error('Error getting teams with current load:', error);
    return [];
  }
};

/**
 * Obtener equipos con alta carga de trabajo
 */
export const getHighLoadTeams = async () => {
  try {
    const teams = await getAllTeamsWithCurrentLoad();
    
    // Calcular utilización y agregar el campo utilization
    const teamsWithUtilization = teams.map(team => ({
      ...team,
      utilization: team.capacity > 0 ? Math.round((team.currentLoad / team.capacity) * 100) : 0
    }));
    
    return teamsWithUtilization
      .filter(team => {
        if (team.capacity <= 0) return false;
        return team.utilization > 50; // Mostrar equipos con más del 50% de utilización para el dashboard
      })
      .sort((a, b) => {
        return b.utilization - a.utilization; // Ordenar por utilización descendente
      });
  } catch (error) {
    console.error('Error getting high load teams:', error);
    return [];
  }
};

/**
 * Obtener todos los equipos con utilización calculada para el dashboard
 */
export const getAllTeamsWithUtilization = async () => {
  try {
    const teams = await getAllTeamsWithCurrentLoad();
    
    // Calcular utilización y agregar el campo utilization para cada equipo
    return teams.map(team => ({
      ...team,
      utilization: team.capacity > 0 ? Math.round((team.currentLoad / team.capacity) * 100) : 0
    }));
  } catch (error) {
    console.error('Error getting teams with utilization:', error);
    return [];
  }
}; 