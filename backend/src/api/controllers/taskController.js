const taskService = require('../services/taskService');

/**
 * Controlador para las tareas - implementa US-08-02 (sistema de filtros avanzados)
 */

/**
 * Obtener tareas con filtros avanzados
 * GET /api/tasks
 * 
 * Query parameters:
 * - search: Búsqueda por texto
 * - departamento: Filtro por departamento
 * - status_id: Filtro por estado de Redmine
 * - priority_id: Filtro por prioridad
 * - equipo_id: Filtro por equipo asignado
 * - etapa: Filtro por etapa (sin_planificar, planificada, en_curso, finalizada)
 * - responsable_negocio: Filtro por responsable de negocio
 * - pendientes_planificar: true/false - solo tareas pendientes de planificar
 * - fecha_inicio_desde, fecha_inicio_hasta: Rango de fechas de inicio
 * - fecha_fin_desde, fecha_fin_hasta: Rango de fechas de fin
 * - estimacion_sprints_min, estimacion_sprints_max: Rango de estimación
 * - sort_by: Campo de ordenamiento
 * - sort_order: asc/desc
 * - offset: Desplazamiento para paginación
 * - limit: Límite de resultados
 */
const getTasks = async (req, res) => {
  try {
    const {
      search,
      departamento,
      status_id,
      priority_id,
      tracker_id,
      assigned_to_id,
      project_id,
      equipo_id,
      etapa,
      responsable_negocio,
      pendientes_planificar,
      fecha_inicio_desde,
      fecha_inicio_hasta,
      fecha_fin_desde,
      fecha_fin_hasta,
      estimacion_sprints_min,
      estimacion_sprints_max,
      sort_by = 'created_on',
      sort_order = 'desc',
      offset = 0,
      limit = 25
    } = req.query;

    // Validar parámetros de paginación
    const parsedOffset = Math.max(0, parseInt(offset) || 0);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 25));

    // Construir objeto de filtros
    const filters = {
      search,
      departamento,
      status_id,
      priority_id,
      tracker_id,
      assigned_to_id,
      project_id,
      equipo_id,
      etapa,
      responsable_negocio,
      pendientes_planificar,
      fecha_inicio_desde,
      fecha_inicio_hasta,
      fecha_fin_desde,
      fecha_fin_hasta,
      estimacion_sprints_min,
      estimacion_sprints_max,
      sort_by,
      sort_order
    };

    // Filtrar valores undefined/null
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
        delete filters[key];
      }
    });

    // Obtener tareas con filtros
    const result = await taskService.getTasksWithFilters(
      filters,
      req.user,
      parsedOffset,
      parsedLimit
    );

    return res.status(200).json({
      success: true,
      message: 'Tareas obtenidas correctamente',
      data: result.data,
      filters_applied: filters
    });

  } catch (error) {
    console.error('Error en getTasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener tareas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener una tarea específica por ID
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    const taskId = parseInt(id);
    if (isNaN(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de tarea inválido'
      });
    }

    // Obtener tarea
    const result = await taskService.getTaskById(taskId);

    return res.status(200).json({
      success: true,
      message: 'Tarea obtenida correctamente',
      data: result.data
    });

  } catch (error) {
    console.error('Error en getTaskById:', error);
    
    if (error.message === 'Tarea no encontrada') {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener la tarea',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener estadísticas de tareas para dashboards/KPIs
 * GET /api/tasks/stats
 */
const getTaskStats = async (req, res) => {
  try {
    const { departamento } = req.query;
    
    // Construir filtros base
    const filters = {};
    if (departamento) {
      filters.departamento = departamento;
    }

    // Obtener todas las tareas para calcular estadísticas
    const allTasks = await taskService.getTasksWithFilters(
      filters,
      req.user,
      0,
      10000  // Límite alto para obtener todas las tareas
    );

    const tasks = allTasks.data.tasks;

    // Calcular estadísticas
    const stats = {
      total_tareas: tasks.length,
      
      // Por etapa
      por_etapa: {
        sin_planificar: tasks.filter(t => t.etapa === 'sin_planificar').length,
        planificada: tasks.filter(t => t.etapa === 'planificada').length,
        en_curso: tasks.filter(t => t.etapa === 'en_curso').length,
        finalizada: tasks.filter(t => t.etapa === 'finalizada').length
      },
      
      // Por estado
      por_estado: tasks.reduce((acc, task) => {
        const estado = task.status?.name || 'Sin estado';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {}),
      
      // Por prioridad
      por_prioridad: tasks.reduce((acc, task) => {
        const prioridad = task.priority?.name || 'Sin prioridad';
        acc[prioridad] = (acc[prioridad] || 0) + 1;
        return acc;
      }, {}),
      
      // Tareas problemáticas
      problematicas: {
        sin_responsable: tasks.filter(t => !t.tiene_responsable).length,
        sin_funcional: tasks.filter(t => !t.tiene_funcional).length,
        sin_equipo_asignado: tasks.filter(t => !t.tiene_equipo_asignado && t.esta_planificada).length,
        pendientes_planificar: tasks.filter(t => t.tiene_responsable && t.tiene_funcional && !t.esta_planificada).length
      },
      
      // Estadísticas de estimación
      estimacion: {
        total_sprints_planificados: tasks
          .filter(t => t.estimacion_sprints)
          .reduce((sum, t) => sum + t.estimacion_sprints, 0),
        promedio_sprints: tasks
          .filter(t => t.estimacion_sprints)
          .reduce((sum, t, _, arr) => sum + t.estimacion_sprints / arr.length, 0),
        tareas_sin_estimacion: tasks.filter(t => !t.estimacion_sprints).length
      },
      
      // Por departamento (si no se filtró por uno específico)
      por_departamento: departamento ? null : tasks.reduce((acc, task) => {
        const dept = task.departamento || 'Sin departamento';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {}),
      
      // Por equipo
      por_equipo: tasks.reduce((acc, task) => {
        const equipo = task.equipo_asignado?.nombre || 'Sin asignar';
        acc[equipo] = (acc[equipo] || 0) + 1;
        return acc;
      }, {})
    };

    return res.status(200).json({
      success: true,
      message: 'Estadísticas obtenidas correctamente',
      data: stats,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en getTaskStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener valores únicos para filtros dinámicos
 * GET /api/tasks/filter-options
 */
const getFilterOptions = async (req, res) => {
  try {
    // Obtener todas las tareas para extraer valores únicos
    const allTasks = await taskService.getTasksWithFilters(
      {},
      req.user,
      0,
      10000
    );

    const tasks = allTasks.data.tasks;

    // Extraer valores únicos
    const options = {
      departamentos: [...new Set(tasks.map(t => t.departamento).filter(Boolean))].sort(),
      responsables_negocio: [...new Set(tasks.map(t => t.responsable_negocio).filter(Boolean))].sort(),
      equipos: [...new Set(tasks
        .filter(t => t.equipo_asignado)
        .map(t => ({ id: t.equipo_asignado.id, nombre: t.equipo_asignado.nombre }))
      )],
      estados: [...new Set(tasks.map(t => t.status?.name).filter(Boolean))].sort(),
      prioridades: [...new Set(tasks.map(t => t.priority?.name).filter(Boolean))].sort(),
      proyectos: [...new Set(tasks.map(t => t.project?.name).filter(Boolean))].sort(),
      etapas: ['sin_planificar', 'planificada', 'en_curso', 'finalizada']
    };

    // Remover duplicados en equipos por ID
    options.equipos = options.equipos.filter((equipo, index, self) => 
      index === self.findIndex(e => e.id === equipo.id)
    ).sort((a, b) => a.nombre.localeCompare(b.nombre));

    return res.status(200).json({
      success: true,
      message: 'Opciones de filtro obtenidas correctamente',
      data: options
    });

  } catch (error) {
    console.error('Error en getFilterOptions:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener opciones de filtro',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar estimación de una tarea
 * PUT /api/tasks/:id/estimation
 * 
 * Solo usuarios con rol TECNOLOGIA pueden estimar tareas
 * Solo tareas en estado "Nuevo" (backlog) pueden ser estimadas
 */
const updateTaskEstimation = async (req, res) => {
  try {
    const { id } = req.params;
    const { estimacion_sprints, factor_carga } = req.body;

    // Validar ID
    const taskId = parseInt(id);
    if (isNaN(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de tarea inválido'
      });
    }

    // Validar datos de entrada
    if (!estimacion_sprints || !factor_carga) {
      return res.status(400).json({
        success: false,
        message: 'Los campos estimacion_sprints y factor_carga son obligatorios'
      });
    }

    // Validar rangos
    if (estimacion_sprints < 0.5 || estimacion_sprints > 50) {
      return res.status(400).json({
        success: false,
        message: 'La estimación en sprints debe estar entre 0.5 y 50'
      });
    }

    if (factor_carga < 0.5 || factor_carga > 20) {
      return res.status(400).json({
        success: false,
        message: 'El factor de carga debe estar entre 0.5 y 20'
      });
    }

    // Actualizar estimación
    const result = await taskService.updateTaskEstimation(
      taskId,
      parseFloat(estimacion_sprints),
      parseFloat(factor_carga),
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Estimación actualizada correctamente',
      data: result.data
    });

  } catch (error) {
    console.error('Error en updateTaskEstimation:', error);

    if (error.message === 'Tarea no encontrada') {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    if (error.message.includes('no se puede estimar')) {
      return res.status(422).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Sin permisos')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar la estimación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener recomendaciones de equipos para una tarea
 * GET /api/tasks/:id/recommendations
 * 
 * Solo usuarios con rol TECNOLOGIA pueden ver recomendaciones
 * Solo tareas con estimación pueden ser planificadas
 */
const getTeamRecommendations = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    const taskId = parseInt(id);
    if (isNaN(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de tarea inválido'
      });
    }

    // Obtener recomendaciones
    const result = await taskService.getTeamRecommendations(taskId, req.user);

    return res.status(200).json({
      success: true,
      message: 'Recomendaciones obtenidas correctamente',
      data: result.data
    });

  } catch (error) {
    console.error('Error en getTeamRecommendations:', error);

    if (error.message === 'Tarea no encontrada') {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    if (error.message.includes('no se puede planificar')) {
      return res.status(422).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Sin permisos')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener recomendaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Asignar equipo y fechas a una tarea
 * PUT /api/tasks/:id/assignment
 * 
 * Solo usuarios con rol TECNOLOGIA pueden asignar equipos
 * Solo tareas con estimación pueden ser planificadas
 */
const assignTeamAndDates = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipo_id, fecha_inicio, fecha_fin } = req.body;

    // Validar ID
    const taskId = parseInt(id);
    if (isNaN(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de tarea inválido'
      });
    }

    // Validar datos de entrada
    if (!equipo_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Los campos equipo_id, fecha_inicio y fecha_fin son obligatorios'
      });
    }

    // Validar fechas
    const startDate = new Date(fecha_inicio);
    const endDate = new Date(fecha_fin);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas proporcionadas no son válidas'
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
    }

    // Asignar equipo y fechas
    const result = await taskService.assignTeamAndDates(
      taskId,
      parseInt(equipo_id),
      startDate,
      endDate,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Tarea asignada correctamente',
      data: result.data
    });

  } catch (error) {
    console.error('Error en assignTeamAndDates:', error);

    if (error.message === 'Tarea no encontrada') {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    if (error.message === 'Equipo no encontrado') {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    if (error.message.includes('no se puede planificar')) {
      return res.status(422).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Sin permisos')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al asignar la tarea',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  getTaskStats,
  getFilterOptions,
  updateTaskEstimation,
  getTeamRecommendations,
  assignTeamAndDates
}; 