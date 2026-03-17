const { prisma } = require('../../config/database');
const redmineServiceInstance = require('./redmine.service');

/**
 * Servicio para gestión de tareas que combina datos de Redmine y TaskDistributor
 */

// Adapter para mantener compatibilidad con la función getIssues
const redmineService = {
  async getIssues(filters = {}, offset = 0, limit = 25) {
    // Construir parámetros para Redmine API
    const params = {
      ...filters,
      offset,
      limit,
      include: 'custom_fields' // Incluir campos personalizados
    };
    
    console.log(`🔍 Calling Redmine with params:`, JSON.stringify(params, null, 2));
    
    // Llamar al método real del servicio
    const response = await redmineServiceInstance.listIssues(params);
    
    console.log(`✅ Redmine response: ${response.issues?.length || 0} issues, total: ${response.total_count || 0}`);
    
    // Retornar en el formato esperado
    return {
      issues: response.issues || [],
      total_count: response.total_count || 0,
      offset: response.offset || offset,
      limit: response.limit || limit
    };
  },
  
  async getIssue(issueId) {
    // Incluir campos personalizados al obtener una tarea específica
    return await redmineServiceInstance.getIssue(issueId, { include: 'custom_fields' });
  }
};

/**
 * Combina datos de Redmine con información extendida de TaskDistributor
 * @param {Array} redmineTasks - Tareas de Redmine
 * @returns {Promise<Array>} Tareas combinadas con información extendida
 */
const combineTasksWithExtendedData = async (redmineTasks) => {
  if (!redmineTasks || redmineTasks.length === 0) {
    return [];
  }

  const redmineIds = redmineTasks.map(task => task.id);
  
  // Obtener información extendida de TaskDistributor
  const extendedTasks = await prisma.tareaExtended.findMany({
    where: {
      redmineTaskId: {
        in: redmineIds
      }
    },
    include: {
      asignaciones: {
        include: {
          equipo: true
        },
        orderBy: {
          fechaAsignacion: 'desc'
        },
        take: 1
      }
    }
  });

  // Obtener todos los departamentos para mapeo
  const departamentos = await prisma.departamento.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true
    }
  });

  // Crear mapas para acceso rápido
  const extendedTasksMap = new Map();
  extendedTasks.forEach(task => {
    extendedTasksMap.set(task.redmineTaskId, task);
  });

  const departamentosMap = new Map();
  departamentos.forEach(dept => {
    departamentosMap.set(dept.nombre.toLowerCase(), dept);
  });

  // Auto-crear registros faltantes para tareas de Redmine que no existen en TaskDistributor
  const missingRedmineIds = redmineIds.filter(id => !extendedTasksMap.has(id));
  
  if (missingRedmineIds.length > 0) {
    console.log(`🔄 Auto-creando ${missingRedmineIds.length} registros TaskDistributor para tareas: ${missingRedmineIds.join(', ')}`);
    
    // Crear registros faltantes en lote
    const newExtendedTasks = await Promise.all(
      missingRedmineIds.map(redmineTaskId => 
        prisma.tareaExtended.create({
          data: {
            redmineTaskId,
            ordenPrioridad: null, // Se definirá desde TaskDistributor
            factorCarga: 1.0, // Valor por defecto
            estimacionSprints: null, // Se estimará desde TaskDistributor
            fechaInicioPlanificada: null, // Se planificará desde TaskDistributor
            fechaFinPlanificada: null
          },
          include: {
            asignaciones: {
              include: {
                equipo: true
              },
              orderBy: {
                fechaAsignacion: 'desc'
              },
              take: 1
            }
          }
        })
      )
    );

    // Agregar los nuevos registros al mapa
    newExtendedTasks.forEach(task => {
      extendedTasksMap.set(task.redmineTaskId, task);
    });
  }

  // Combinar datos
  return redmineTasks.map(redmineTask => {
    const extended = extendedTasksMap.get(redmineTask.id);
    const currentAssignment = extended?.asignaciones?.[0];

    // Extraer información de campos personalizados de Redmine
    const customFields = redmineTask.custom_fields || [];
    
    // Debug: Log de custom fields disponibles (solo en desarrollo)
    if (process.env.NODE_ENV === 'development' && customFields.length > 0) {
      console.log(`🔍 Task ${redmineTask.id} custom_fields:`, customFields.map(cf => `${cf.name}="${cf.value}"`).join(', '));
    }
    
    // Buscar campos con nombres case-insensitive para mayor flexibilidad
    const departamentoNombre = customFields.find(cf => 
      cf.name && cf.name.toLowerCase() === 'departamento'
    )?.value;
    
    const responsableNegocio = customFields.find(cf => 
      cf.name && (cf.name.toLowerCase() === 'responsable_negocio' || cf.name.toLowerCase() === 'responsable negocio')
    )?.value;
    
    const funcional = customFields.find(cf => 
      cf.name && cf.name.toLowerCase() === 'funcional'
    )?.value;

    // Buscar el departamento en la base de datos
    let departamentoInfo = null;
    if (departamentoNombre) {
      departamentoInfo = departamentosMap.get(departamentoNombre.toLowerCase());
    }

    // Determinar la etapa de la tarea
    let etapa = 'sin_planificar';
    if (extended?.fechaInicioPlanificada && extended?.fechaFinPlanificada) {
      const hoy = new Date();
      const fechaInicio = new Date(extended.fechaInicioPlanificada);
      const fechaFin = new Date(extended.fechaFinPlanificada);
      
      if (hoy < fechaInicio) {
        etapa = 'planificada';
      } else if (hoy >= fechaInicio && hoy <= fechaFin) {
        etapa = 'en_curso';
      } else if (hoy > fechaFin) {
        etapa = 'finalizada';
      }
    }

    // Debug: Logging para entender qué devuelve Redmine para el status
    console.log(`🔍 Task ${redmineTask.id} status debug:`, {
      raw_status: redmineTask.status,
      status_type: typeof redmineTask.status,
      status_name: redmineTask.status?.name,
      status_id: redmineTask.status?.id
    });
    
    // Normalizar el status para usar nombre en lugar de objeto de Redmine
    let statusName;
    if (redmineTask.status && typeof redmineTask.status === 'object') {
      // Si es un objeto con name e id (formato típico de Redmine)
      if (redmineTask.status.name) {
        statusName = redmineTask.status.name;
        console.log(`✅ Using status.name: "${statusName}"`);
      } else if (redmineTask.status.id) {
        console.log(`⚠️ No status.name, trying ID mapping for ID ${redmineTask.status.id}`);
        statusName = REDMINE_STATUS_ID_TO_NAME[redmineTask.status.id];
        if (!statusName) {
          console.log(`❌ No mapping found for status ID ${redmineTask.status.id}`);
          statusName = `Status ID ${redmineTask.status.id}`; // Fallback para debug
        } else {
          console.log(`✅ Mapped ID ${redmineTask.status.id} to "${statusName}"`);
        }
      }
    } else if (typeof redmineTask.status === 'string') {
      // Si ya es un string, usarlo directamente
      statusName = redmineTask.status;
      console.log(`✅ Using string status: "${statusName}"`);
    }
    
    console.log(`🔄 Task ${redmineTask.id} final status: "${statusName}"`);
    
    return {
      // Datos de Redmine
      id: redmineTask.id,
      subject: redmineTask.subject,
      description: redmineTask.description,
      status: statusName || 'Backlog', // Fallback por defecto
      priority: redmineTask.priority,
      author: redmineTask.author,
      assigned_to: redmineTask.assigned_to,
      created_on: redmineTask.created_on,
      updated_on: redmineTask.updated_on,
      due_date: redmineTask.due_date,
      done_ratio: redmineTask.done_ratio,
      project: redmineTask.project,
      tracker: redmineTask.tracker,
      
      // Información de campos personalizados
      departamento: departamentoNombre,
      departamento_id: departamentoInfo?.id,
      departamento_nombre: departamentoInfo?.nombre || departamentoNombre,
      responsable_negocio: responsableNegocio,
      funcional,
      
      // Datos extendidos de TaskDistributor
      orden_prioridad: extended?.ordenPrioridad,
      factor_carga: extended?.factorCarga,
      estimacion_sprints: extended?.estimacionSprints,
      fecha_inicio_planificada: extended?.fechaInicioPlanificada,
      fecha_fin_planificada: extended?.fechaFinPlanificada,
      
      // Información del equipo asignado
      equipo_asignado: currentAssignment ? {
        id: currentAssignment.equipo.id,
        nombre: currentAssignment.equipo.nombre,
        tipo: currentAssignment.equipo.tipo,
        fecha_asignacion: currentAssignment.fechaAsignacion
      } : null,
      
      // Etapa calculada
      etapa,
      
      // Metadata
      tiene_responsable: !!responsableNegocio,
      tiene_funcional: !!funcional,
      esta_planificada: !!(extended?.fechaInicioPlanificada && extended?.fechaFinPlanificada),
      tiene_equipo_asignado: !!currentAssignment
    };
  });
};

/**
 * Mapeo de nombres de estados a IDs de Redmine
 * NOTA: Los IDs pueden variar según la configuración de tu instancia de Redmine
 * Valores típicos de una instalación estándar de Redmine:
 * - 1: New (Nuevo)
 * - 2: In Progress (En Progreso) 
 * - 3: Resolved (Resuelto)
 * - 4: Feedback (Feedback)
 * - 5: Closed (Cerrado)
 * - 6: Rejected (Rechazado)
 * 
 * Para tu configuración personalizada, mapearemos a los IDs que uses:
 */
const REDMINE_STATUS_NAME_TO_ID = {
  'Backlog': 1,
  'To Do': 2,   // "To Do" con mayúsculas y espacio (exacto de Redmine)
  'Doing': 3,
  'Demo': 4,
  'Done': 5
};

/**
 * Mapeo inverso: IDs de Redmine a nombres de estados
 * Si tu Redmine usa diferentes nombres, ajusta este mapeo
 */
const REDMINE_STATUS_ID_TO_NAME = {
  1: 'Backlog',
  2: 'To Do',
  3: 'Doing', 
  4: 'Demo',
  5: 'Done'
};

/**
 * Construye filtros para Redmine basados en los parámetros de entrada
 * @param {Object} filters - Filtros del frontend
 * @returns {Object} Filtros para Redmine
 */
const buildRedmineFilters = (filters) => {
  const redmineFilters = {};

  if (filters.status_id) {
    console.log(`🔍 Processing status filter: "${filters.status_id}" (type: ${typeof filters.status_id})`);
    
    // Si es un nombre de estado, convertir a ID
    if (typeof filters.status_id === 'string' && REDMINE_STATUS_NAME_TO_ID[filters.status_id]) {
      redmineFilters.status_id = REDMINE_STATUS_NAME_TO_ID[filters.status_id];
      console.log(`🔄 Status name converted: "${filters.status_id}" → ID ${redmineFilters.status_id}`);
    } else if (typeof filters.status_id === 'string' && !isNaN(parseInt(filters.status_id))) {
      // Si es un ID como string, convertir a número
      redmineFilters.status_id = parseInt(filters.status_id);
      console.log(`🔄 Status ID parsed: "${filters.status_id}" → ${redmineFilters.status_id}`);
    } else {
      // Si ya es un número, usar directamente
      redmineFilters.status_id = filters.status_id;
      console.log(`🔄 Status ID used directly: ${redmineFilters.status_id}`);
    }
  }

  if (filters.priority_id) {
    redmineFilters.priority_id = filters.priority_id;
  }

  if (filters.tracker_id) {
    redmineFilters.tracker_id = filters.tracker_id;
  }

  if (filters.assigned_to_id) {
    redmineFilters.assigned_to_id = filters.assigned_to_id;
  }

  if (filters.project_id) {
    redmineFilters.project_id = filters.project_id;
  }

  return redmineFilters;
};

/**
 * Aplica filtros específicos de TaskDistributor a las tareas combinadas
 * @param {Array} tasks - Tareas combinadas
 * @param {Object} filters - Filtros a aplicar
 * @param {Object} user - Usuario autenticado
 * @returns {Array} Tareas filtradas
 */
const applyTaskDistributorFilters = (tasks, filters, user) => {
  let filteredTasks = [...tasks];

  // Filtro por rol de usuario (criterio de aceptación US-08)
  if (user.role === 'NEGOCIO') {
    // Los usuarios de negocio solo ven tareas de su departamento
    // Por ahora, asumimos que el usuario pertenece a todos los departamentos
    // En una implementación real, esto se determinaría por la relación usuario-departamento
  }

  // Filtro por departamento (soporta tanto nombre como ID)
  if (filters.departamento) {
    // Si es un número, filtrar por ID
    const departamentoId = parseInt(filters.departamento);
    if (!isNaN(departamentoId)) {
      filteredTasks = filteredTasks.filter(task => 
        task.departamento_id === departamentoId
      );
    } else {
      // Si es texto, filtrar por nombre
      filteredTasks = filteredTasks.filter(task => 
        task.departamento && task.departamento.toLowerCase().includes(filters.departamento.toLowerCase())
      );
    }
  }

  // Filtro por responsable de negocio
  if (filters.responsable_negocio) {
    filteredTasks = filteredTasks.filter(task => 
      task.responsable_negocio && task.responsable_negocio.toLowerCase().includes(filters.responsable_negocio.toLowerCase())
    );
  }

  // Filtro por equipo asignado
  if (filters.equipo_id) {
    const equipoId = parseInt(filters.equipo_id);
    filteredTasks = filteredTasks.filter(task => 
      task.equipo_asignado && task.equipo_asignado.id === equipoId
    );
  }

  // Filtro por etapa
  if (filters.etapa) {
    filteredTasks = filteredTasks.filter(task => task.etapa === filters.etapa);
  }

  // Filtro para tareas pendientes de planificar
  if (filters.pendientes_planificar === 'true') {
    filteredTasks = filteredTasks.filter(task => 
      task.tiene_responsable && task.tiene_funcional && !task.esta_planificada
    );
  }

  // Filtro por fechas de planificación
  if (filters.fecha_inicio_desde) {
    const fechaDesde = new Date(filters.fecha_inicio_desde);
    filteredTasks = filteredTasks.filter(task => 
      task.fecha_inicio_planificada && new Date(task.fecha_inicio_planificada) >= fechaDesde
    );
  }

  if (filters.fecha_inicio_hasta) {
    const fechaHasta = new Date(filters.fecha_inicio_hasta);
    filteredTasks = filteredTasks.filter(task => 
      task.fecha_inicio_planificada && new Date(task.fecha_inicio_planificada) <= fechaHasta
    );
  }

  if (filters.fecha_fin_desde) {
    const fechaDesde = new Date(filters.fecha_fin_desde);
    filteredTasks = filteredTasks.filter(task => 
      task.fecha_fin_planificada && new Date(task.fecha_fin_planificada) >= fechaDesde
    );
  }

  if (filters.fecha_fin_hasta) {
    const fechaHasta = new Date(filters.fecha_fin_hasta);
    filteredTasks = filteredTasks.filter(task => 
      task.fecha_fin_planificada && new Date(task.fecha_fin_planificada) <= fechaHasta
    );
  }

  // Filtro por estimación de sprints
  if (filters.estimacion_sprints_min) {
    const min = parseInt(filters.estimacion_sprints_min);
    filteredTasks = filteredTasks.filter(task => 
      task.estimacion_sprints && task.estimacion_sprints >= min
    );
  }

  if (filters.estimacion_sprints_max) {
    const max = parseInt(filters.estimacion_sprints_max);
    filteredTasks = filteredTasks.filter(task => 
      task.estimacion_sprints && task.estimacion_sprints <= max
    );
  }

  return filteredTasks;
};

/**
 * Aplica búsqueda por texto en los campos relevantes
 * @param {Array} tasks - Tareas a filtrar
 * @param {string} searchText - Texto de búsqueda
 * @returns {Array} Tareas que coinciden con la búsqueda
 */
const applyTextSearch = (tasks, searchText) => {
  if (!searchText || searchText.trim() === '') {
    return tasks;
  }

  const searchLower = searchText.toLowerCase().trim();
  
  return tasks.filter(task => {
    // Buscar en título
    if (task.subject && task.subject.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Buscar en descripción
    if (task.description && task.description.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Buscar en departamento
    if (task.departamento && task.departamento.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Buscar en responsable de negocio
    if (task.responsable_negocio && task.responsable_negocio.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Buscar en equipo asignado
    if (task.equipo_asignado && task.equipo_asignado.nombre && 
        task.equipo_asignado.nombre.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });
};

/**
 * Aplica ordenamiento a las tareas
 * @param {Array} tasks - Tareas a ordenar
 * @param {string} sortBy - Campo por el que ordenar
 * @param {string} sortOrder - Orden (asc/desc)
 * @returns {Array} Tareas ordenadas
 */
const applySorting = (tasks, sortBy = 'created_on', sortOrder = 'desc') => {
  return tasks.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'subject':
        valueA = a.subject || '';
        valueB = b.subject || '';
        break;
      case 'priority':
        valueA = a.priority?.id || 0;
        valueB = b.priority?.id || 0;
        break;
      case 'status':
        valueA = a.status?.id || 0;
        valueB = b.status?.id || 0;
        break;
      case 'created_on':
        valueA = new Date(a.created_on || 0);
        valueB = new Date(b.created_on || 0);
        break;
      case 'updated_on':
        valueA = new Date(a.updated_on || 0);
        valueB = new Date(b.updated_on || 0);
        break;
      case 'due_date':
        valueA = a.due_date ? new Date(a.due_date) : new Date(0);
        valueB = b.due_date ? new Date(b.due_date) : new Date(0);
        break;
      case 'orden_prioridad':
        valueA = a.orden_prioridad || 999999;
        valueB = b.orden_prioridad || 999999;
        break;
      case 'estimacion_sprints':
        valueA = a.estimacion_sprints || 0;
        valueB = b.estimacion_sprints || 0;
        break;
      default:
        valueA = a.created_on || '';
        valueB = b.created_on || '';
    }
    
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
};

/**
 * Obtiene tareas con filtros avanzados (US-08-02)
 * @param {Object} filters - Filtros a aplicar
 * @param {Object} user - Usuario autenticado
 * @param {number} offset - Desplazamiento para paginación
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Object>} Tareas filtradas con paginación
 */
const getTasksWithFilters = async (filters = {}, user, offset = 0, limit = 25) => {
  try {
    // 1. Construir filtros para Redmine
    const redmineFilters = buildRedmineFilters(filters);
    
    // 2. Obtener tareas de Redmine (con paginación amplia para filtros posteriores)
    const redmineResponse = await redmineService.getIssues(redmineFilters, 0, 1000);
    
    // 3. Combinar con datos extendidos de TaskDistributor
    const combinedTasks = await combineTasksWithExtendedData(redmineResponse.issues);
    
    // 4. Aplicar filtros específicos de TaskDistributor
    let filteredTasks = applyTaskDistributorFilters(combinedTasks, filters, user);
    
    // 5. Aplicar búsqueda por texto si se proporciona
    if (filters.search) {
      filteredTasks = applyTextSearch(filteredTasks, filters.search);
    }
    
    // 6. Aplicar ordenamiento
    const sortedTasks = applySorting(filteredTasks, filters.sort_by, filters.sort_order);
    
    // 7. Aplicar paginación
    const total = sortedTasks.length;
    const paginatedTasks = sortedTasks.slice(offset, offset + limit);
    
    return {
      success: true,
      data: {
        tasks: paginatedTasks,
        pagination: {
          total,
          offset,
          limit,
          pages: Math.ceil(total / limit),
          current_page: Math.floor(offset / limit) + 1
        }
      }
    };
  } catch (error) {
    console.error('Error al obtener tareas con filtros:', error);
    throw new Error('Error interno del servidor al obtener tareas');
  }
};

/**
 * Obtiene una tarea específica con información extendida
 * @param {number} taskId - ID de la tarea
 * @returns {Promise<Object>} Tarea con información extendida
 */
const getTaskById = async (taskId) => {
  try {
    // Obtener tarea de Redmine
    const redmineResponse = await redmineService.getIssue(taskId);
    
    // Combinar con datos extendidos (auto-creará registro si no existe)
    const combinedTasks = await combineTasksWithExtendedData([redmineResponse.issue]);
    
    if (combinedTasks.length === 0) {
      throw new Error('Tarea no encontrada');
    }
    
    return {
      success: true,
      data: combinedTasks[0]
    };
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    throw error;
  }
};

/**
 * Actualiza la estimación de una tarea en TaskDistributor
 * @param {number} taskId - ID de la tarea en Redmine
 * @param {number} estimacionSprints - Estimación en sprints
 * @param {number} factorCarga - Factor de carga de trabajo
 * @param {Object} user - Usuario autenticado
 * @returns {Promise<Object>} Tarea actualizada con información extendida
 */
const updateTaskEstimation = async (taskId, estimacionSprints, factorCarga, user) => {
  try {
    // 1. Verificar que el usuario tenga permisos (solo TECNOLOGIA)
    if (user.role !== 'TECNOLOGIA') {
      throw new Error('Sin permisos: solo usuarios de tecnología pueden estimar tareas');
    }

    // 2. Verificar que la tarea existe en Redmine
    const redmineResponse = await redmineService.getIssue(taskId);
    if (!redmineResponse.issue) {
      throw new Error('Tarea no encontrada');
    }

    const redmineTask = redmineResponse.issue;

    // 3. Verificar que la tarea está en estado correcto para estimación
    // Solo tareas con estado "Backlog" pueden ser estimadas
    const allowedStatusesForEstimation = ['Backlog'];
    const statusName = redmineTask.status?.name || redmineTask.status;
    if (!allowedStatusesForEstimation.includes(statusName)) {
      throw new Error(`La tarea no se puede estimar en su estado actual: ${statusName}. Solo se pueden estimar tareas en estado "Backlog"`);
    }

    // 4. Buscar o crear registro extendido
    let extendedTask = await prisma.tareaExtended.findUnique({
      where: {
        redmineTaskId: taskId
      },
      include: {
        asignaciones: {
          include: {
            equipo: true
          },
          orderBy: {
            fechaAsignacion: 'desc'
          },
          take: 1
        }
      }
    });

    if (!extendedTask) {
      // Crear registro extendido si no existe
      extendedTask = await prisma.tareaExtended.create({
        data: {
          redmineTaskId: taskId,
          ordenPrioridad: null,
          factorCarga: factorCarga,
          estimacionSprints: estimacionSprints,
          fechaInicioPlanificada: null,
          fechaFinPlanificada: null
        },
        include: {
          asignaciones: {
            include: {
              equipo: true
            },
            orderBy: {
              fechaAsignacion: 'desc'
            },
            take: 1
          }
        }
      });
    } else {
      // Actualizar registro existente
      extendedTask = await prisma.tareaExtended.update({
        where: {
          id: extendedTask.id
        },
        data: {
          factorCarga: factorCarga,
          estimacionSprints: estimacionSprints
        },
        include: {
          asignaciones: {
            include: {
              equipo: true
            },
            orderBy: {
              fechaAsignacion: 'desc'
            },
            take: 1
          }
        }
      });
    }

    // 5. Combinar datos de Redmine con TaskDistributor
    const combinedTasks = await combineTasksWithExtendedData([redmineTask]);
    
    if (combinedTasks.length === 0) {
      throw new Error('Error al combinar datos de la tarea');
    }

    return {
      success: true,
      data: combinedTasks[0]
    };

  } catch (error) {
    console.error('Error al actualizar estimación de tarea:', error);
    throw error;
  }
};

/**
 * Obtiene recomendaciones de equipos para una tarea específica
 * @param {number} taskId - ID de la tarea en Redmine
 * @param {Object} user - Usuario autenticado
 * @returns {Promise<Object>} Recomendaciones de equipos ordenadas por puntuación
 */
const getTeamRecommendations = async (taskId, user) => {
  try {
    // 1. Verificar permisos (solo TECNOLOGIA)
    if (user.role !== 'TECNOLOGIA') {
      throw new Error('Sin permisos: solo usuarios de tecnología pueden ver recomendaciones');
    }

    // 2. Obtener la tarea y verificar que se puede planificar
    const taskResult = await getTaskById(taskId);
    const task = taskResult.data;

    // Verificar que la tarea tiene estimación
    if (!task.estimacion_sprints || !task.factor_carga) {
      throw new Error('La tarea no se puede planificar: requiere estimación de sprints y factor de carga');
    }

    // Verificar que la tarea está en estado correcto
    const allowedStatuses = ['Backlog', 'To Do']; // Estados que permiten planificación
    if (!allowedStatuses.includes(task.status)) {
      throw new Error(`La tarea no se puede planificar en su estado actual: ${task.status}`);
    }

    // 3. Obtener información del departamento
    let departamentoId = null;
    if (task.departamento) {
      const departamento = await prisma.departamento.findFirst({
        where: { 
          nombre: { 
            equals: task.departamento,
            mode: 'insensitive' 
          },
          activo: true 
        }
      });
      departamentoId = departamento?.id;
    }

    // 4. Obtener todos los equipos activos
    const equipos = await prisma.equipo.findMany({
      where: { activo: true },
      include: {
        asignaciones: {
          include: {
            tarea: true
          },
          where: {
            tarea: {
              fechaFinPlanificada: {
                gte: new Date() // Solo asignaciones activas
              }
            }
          }
        }
      }
    });

    // 5. Calcular recomendaciones para cada equipo
    const recommendations = await Promise.all(
      equipos.map(async (equipo) => {
        // Obtener afinidad con el departamento
        let affinity = 1; // Valor por defecto
        if (departamentoId) {
          const afinidad = await prisma.matrizAfinidad.findUnique({
            where: {
              equipoId_departamentoId: {
                equipoId: equipo.id,
                departamentoId: departamentoId
              }
            }
          });
          affinity = afinidad?.nivelAfinidad || 1;
        }

        // Calcular carga actual del equipo
        const currentLoad = equipo.asignaciones.reduce((total, asignacion) => {
          return total + (asignacion.tarea.factorCarga || 1);
        }, 0);

        // Calcular fechas posibles
        const { possibleStartDate, possibleEndDate } = calculatePossibleDates(
          equipo, 
          task.estimacion_sprints, 
          task.factor_carga
        );

        // Obtener proyectos actuales
        const currentProjects = await getCurrentProjects(equipo.id);

        // Calcular puntuación de recomendación
        const recommendationScore = calculateRecommendationScore(
          affinity,
          equipo.capacidad - currentLoad,
          equipo.capacidad,
          possibleStartDate,
          equipo.tipo === 'INTERNO'
        );

        return {
          teamId: equipo.id,
          teamName: equipo.nombre,
          isExternal: equipo.tipo === 'EXTERNO',
          currentLoad: Math.round(currentLoad * 10) / 10,
          capacity: equipo.capacidad,
          affinity: affinity,
          possibleStartDate: possibleStartDate.toISOString().split('T')[0],
          possibleEndDate: possibleEndDate.toISOString().split('T')[0],
          recommendationScore: recommendationScore,
          currentProjects: currentProjects
        };
      })
    );

    // 6. Ordenar por puntuación descendente
    recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return {
      success: true,
      data: recommendations
    };

  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    throw error;
  }
};

/**
 * Asigna un equipo y fechas a una tarea
 * @param {number} taskId - ID de la tarea en Redmine
 * @param {number} equipoId - ID del equipo a asignar
 * @param {Date} fechaInicio - Fecha de inicio planificada
 * @param {Date} fechaFin - Fecha de fin planificada
 * @param {Object} user - Usuario autenticado
 * @returns {Promise<Object>} Tarea actualizada
 */
const assignTeamAndDates = async (taskId, equipoId, fechaInicio, fechaFin, user) => {
  try {
    // 1. Verificar permisos (solo TECNOLOGIA)
    if (user.role !== 'TECNOLOGIA') {
      throw new Error('Sin permisos: solo usuarios de tecnología pueden asignar equipos');
    }

    // 2. Verificar que la tarea existe y se puede planificar
    const taskResult = await getTaskById(taskId);
    const task = taskResult.data;

    if (!task.estimacion_sprints || !task.factor_carga) {
      throw new Error('La tarea no se puede planificar: requiere estimación de sprints y factor de carga');
    }

    const allowedStatuses = ['Backlog', 'To Do']; // Estados que permiten planificación
    if (!allowedStatuses.includes(task.status)) {
      throw new Error(`La tarea no se puede planificar en su estado actual: ${task.status}`);
    }

    // 3. Verificar que el equipo existe
    const equipo = await prisma.equipo.findUnique({
      where: { id: equipoId, activo: true }
    });

    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    // 4. Iniciar transacción para actualizar tarea extendida y crear asignación
    const result = await prisma.$transaction(async (prisma) => {
      // Actualizar la tarea extendida con las fechas
      const updatedTask = await prisma.tareaExtended.update({
        where: { redmineTaskId: taskId },
        data: {
          fechaInicioPlanificada: fechaInicio,
          fechaFinPlanificada: fechaFin
        }
      });

      // Crear nueva asignación
      await prisma.asignacion.create({
        data: {
          tareaId: updatedTask.id,
          equipoId: equipoId,
          fechaAsignacion: new Date()
        }
      });

      return updatedTask;
    });

    // 5. Obtener la tarea actualizada con toda la información
    const updatedTaskResult = await getTaskById(taskId);

    return {
      success: true,
      data: updatedTaskResult.data
    };

  } catch (error) {
    console.error('Error al asignar equipo y fechas:', error);
    throw error;
  }
};

/**
 * Calcula las fechas posibles de inicio y fin para un equipo
 * @param {Object} equipo - Equipo con sus asignaciones
 * @param {number} estimacionSprints - Estimación en sprints
 * @param {number} factorCarga - Factor de carga
 * @returns {Object} Fechas posibles
 */
const calculatePossibleDates = (equipo, estimacionSprints, factorCarga) => {
  const today = new Date();
  let possibleStartDate = new Date(today);

  // Calcular disponibilidad actual del equipo
  const currentLoad = equipo.asignaciones.reduce((total, asignacion) => {
    return total + (asignacion.tarea.factorCarga || 1);
  }, 0);

  const availableCapacity = equipo.capacidad - currentLoad;

  // Si el equipo no tiene capacidad disponible, encontrar la próxima fecha libre
  if (availableCapacity < factorCarga) {
    // Encontrar la fecha más tardía de finalización de proyectos actuales
    const endDates = equipo.asignaciones
      .filter(a => a.tarea.fechaFinPlanificada)
      .map(a => new Date(a.tarea.fechaFinPlanificada));

    if (endDates.length > 0) {
      const latestEndDate = new Date(Math.max(...endDates));
      possibleStartDate = new Date(latestEndDate);
      possibleStartDate.setDate(possibleStartDate.getDate() + 1); // Día siguiente
    }
  }

  // Calcular fecha de fin (sprints * 2 semanas)
  const possibleEndDate = new Date(possibleStartDate);
  possibleEndDate.setDate(possibleEndDate.getDate() + (estimacionSprints * 14));

  return { possibleStartDate, possibleEndDate };
};

/**
 * Calcula la puntuación de recomendación para un equipo
 * @param {number} affinity - Afinidad con el departamento (1-5)
 * @param {number} availableCapacity - Capacidad disponible
 * @param {number} totalCapacity - Capacidad total
 * @param {Date} possibleStartDate - Fecha posible de inicio
 * @param {boolean} isInternal - Si es equipo interno
 * @returns {number} Puntuación de recomendación
 */
const calculateRecommendationScore = (affinity, availableCapacity, totalCapacity, possibleStartDate, isInternal) => {
  let score = 0;

  // Factor de afinidad (40% del peso)
  score += (affinity / 5) * 40;

  // Factor de disponibilidad (35% del peso)
  const capacityRatio = Math.max(0, availableCapacity) / totalCapacity;
  score += capacityRatio * 35;

  // Factor de tiempo (15% del peso) - cuanto antes pueda empezar, mejor
  const today = new Date();
  const daysUntilStart = Math.max(0, (possibleStartDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  const timeScore = Math.max(0, 15 - (daysUntilStart / 7)); // Menos puntos por cada semana de retraso
  score += timeScore;

  // Bonus por equipo interno (10% del peso)
  if (isInternal) {
    score += 10;
  }

  return Math.round(score * 10) / 10; // Redondear a 1 decimal
};

/**
 * Obtiene los proyectos actuales de un equipo
 * @param {number} equipoId - ID del equipo
 * @returns {Promise<Array>} Proyectos actuales
 */
const getCurrentProjects = async (equipoId) => {
  const today = new Date();
  
  const asignaciones = await prisma.asignacion.findMany({
    where: {
      equipoId: equipoId,
      tarea: {
        fechaFinPlanificada: {
          gte: today // Solo proyectos que no han terminado
        }
      }
    },
    include: {
      tarea: {
        include: {
          _count: {
            select: {
              asignaciones: true
            }
          }
        }
      }
    },
    orderBy: {
      tarea: {
        fechaInicioPlanificada: 'asc'
      }
    }
  });

  // Obtener información completa de las tareas incluyendo datos de Redmine y departamento
  const projects = await Promise.all(
    asignaciones.map(async (asignacion) => {
      try {
        const redmineTask = await redmineService.getIssue(asignacion.tarea.redmineTaskId);
        
        // Determinar estado del proyecto
        let status = 'doing';
        const fechaInicio = asignacion.tarea.fechaInicioPlanificada;
        const fechaFin = asignacion.tarea.fechaFinPlanificada;
        
        if (fechaInicio && fechaFin) {
          const inicio = new Date(fechaInicio);
          const fin = new Date(fechaFin);
          const daysDiff = Math.ceil((fin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (today < inicio) {
            status = 'todo';
          } else if (daysDiff <= 7) {
            status = 'demo';
          }
        }

        // Obtener nombre del departamento desde campos personalizados de Redmine
        let departmentName = 'Sin Departamento';
        console.log(`🔍 Buscando departamento para tarea ${asignacion.tarea.redmineTaskId}:`, {
          customFields: redmineTask.issue?.custom_fields?.map(cf => `${cf.name}="${cf.value}"`).join(', ')
        });
        
        // Extraer departamento de campos personalizados (misma lógica que combineTasksWithExtendedData)
        const customFields = redmineTask.issue?.custom_fields || [];
        const departamentoNombre = customFields.find(cf => 
          cf.name && cf.name.toLowerCase() === 'departamento'
        )?.value;
        
        if (departamentoNombre) {
          try {
            const departamento = await prisma.departamento.findFirst({
              where: { 
                nombre: {
                  equals: departamentoNombre,
                  mode: 'insensitive'
                }
              }
            });
            console.log(`🔍 Departamento encontrado:`, departamento);
            if (departamento) {
              departmentName = departamento.nombre;
            }
          } catch (deptError) {
            console.error('Error al obtener departamento:', deptError);
          }
        }

        return {
          id: asignacion.tarea.redmineTaskId,
          name: redmineTask.issue?.subject || `Tarea #${asignacion.tarea.redmineTaskId}`,
          startDate: asignacion.tarea.fechaInicioPlanificada,
          endDate: asignacion.tarea.fechaFinPlanificada,
          status: status,
          loadFactor: asignacion.tarea.factorCarga || 1,
          sprints: asignacion.tarea.estimacionSprints,
          department: departmentName
        };
      } catch (error) {
        console.error(`Error al obtener tarea ${asignacion.tarea.redmineTaskId}:`, error);
        return {
          id: asignacion.tarea.redmineTaskId,
          name: `Tarea #${asignacion.tarea.redmineTaskId}`,
          startDate: asignacion.tarea.fechaInicioPlanificada,
          endDate: asignacion.tarea.fechaFinPlanificada,
          status: 'doing',
          loadFactor: asignacion.tarea.factorCarga || 1,
          sprints: asignacion.tarea.estimacionSprints,
          department: 'Sin Departamento'
        };
      }
    })
  );

  return projects;
};

module.exports = {
  getTasksWithFilters,
  getTaskById,
  updateTaskEstimation,
  getTeamRecommendations,
  assignTeamAndDates,
  combineTasksWithExtendedData,
  applyTextSearch,
  applySorting,
}; 