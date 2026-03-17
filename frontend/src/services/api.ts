import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Crear una instancia de axios con la configuración por defecto
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de tareas
export const taskService = {
  getTasks: async (filters?: Record<string, any>) => {
    const response = await api.get('/tasks', { params: filters });
    return response.data; // { success: true, data: result.data, ... }
  },
  
  getTaskById: async (id: number) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data; // { success: true, data: result.data, ... }
  },
  
  getTaskStats: async (filters?: Record<string, any>) => {
    const response = await api.get('/tasks/stats', { params: filters });
    return response.data; // { success: true, data: stats, ... }
  },
  
  getFilterOptions: async () => {
    const response = await api.get('/tasks/filter-options');
    return response.data; // { success: true, data: options, ... }
  },
  
  createTask: async (taskData: any) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  
  updateTask: async (id: number, taskData: any) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  
  deleteTask: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  updateTaskEstimation: async (id: number, estimationData: { estimacion_sprints: number; factor_carga: number }) => {
    const response = await api.put(`/tasks/${id}/estimation`, estimationData);
    return response.data;
  },

  getRecommendations: async (taskId: number) => {
    const response = await api.get(`/tasks/${taskId}/recommendations`);
    return response.data;
  },

  assignTeamAndDates: async (taskId: number, assignmentData: { equipo_id: number; fecha_inicio: string; fecha_fin: string }) => {
    const response = await api.put(`/tasks/${taskId}/assignment`, assignmentData);
    return response.data;
  },

  checkTeamConflicts: async (teamId: number, startDate: string, endDate: string, excludeTaskId?: number) => {
    const response = await api.get(`/teams/${teamId}/conflicts`, {
      params: {
        start_date: startDate,
        end_date: endDate,
        exclude_task_id: excludeTaskId
      }
    });
    return response.data;
  },
};

// Servicios de equipos
export const teamService = {
  getTeams: async (filters?: Record<string, any>) => {
    const response = await api.get('/equipos', { params: filters });
    return response.data;
  },
  
  getTeamById: async (id: number) => {
    const response = await api.get(`/equipos/${id}`);
    return response.data;
  },
  
  getTeamStats: async () => {
    const response = await api.get('/equipos/stats');
    return response.data;
  },
  
  getTeamCapacity: async () => {
    const response = await api.get('/equipos/capacidad');
    return response.data;
  },
  
  updateTeam: async (id: number, teamData: any) => {
    const response = await api.put(`/equipos/${id}`, teamData);
    return response.data;
  },
};

// Servicios de departamentos
export const departmentService = {
  getDepartments: async (filters?: Record<string, any>) => {
    const response = await api.get('/departamentos', { params: filters });
    return response.data;
  },
  
  getDepartmentById: async (id: number) => {
    const response = await api.get(`/departamentos/${id}`);
    return response.data;
  },
  
  getDepartmentStats: async () => {
    const response = await api.get('/departamentos/stats');
    return response.data;
  },
};

// Servicios de usuarios
export const userService = {
  getUsers: async (filters?: Record<string, any>) => {
    const response = await api.get('/redmine/users', { params: filters });
    return response.data; // { success: true, data: users, ... }
  },
  
  getUserById: async (id: number) => {
    const response = await api.get(`/redmine/users/${id}`);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/redmine/users/current');
    return response.data;
  },
};

// Servicios de matriz de afinidad
export const affinityService = {
  getAffinityMatrix: async () => {
    const response = await api.get('/affinity');
    return response.data;
  },
  
  updateAffinityMatrix: async (matrixData: any) => {
    const response = await api.put('/affinity', matrixData);
    return response.data;
  },
};

// Servicio de autenticación
export const authService = {
  login: async (username: string, password: string) => {
    // El backend espera email, así que asumimos que username es el email
    const response = await api.post('/auth/login', { email: username, password });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export default api; 