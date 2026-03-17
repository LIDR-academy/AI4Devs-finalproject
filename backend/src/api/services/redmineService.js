/**
 * Servicio mock para simular la integración con Redmine
 * Este servicio será reemplazado por la implementación real cuando se configure Redmine
 */

// Datos mock para simular tareas de Redmine
const mockRedmineTasks = [
  {
    id: 10001,
    subject: 'Implementar sistema de notificaciones push',
    description: 'Desarrollar funcionalidad para enviar notificaciones push a usuarios móviles',
    project: { id: 1, name: 'Proyecto Marketing' },
    tracker: { id: 2, name: 'Feature' },
    status: { id: 1, name: 'Backlog' },
    priority: { id: 4, name: 'Alta' },
    author: { id: 1, name: 'Juan Pérez' },
    assigned_to: { id: 2, name: 'María García' },
    created_on: '2025-01-01T10:00:00Z',
    updated_on: '2025-01-05T14:30:00Z',
    due_date: '2025-02-15',
    done_ratio: 0,
    custom_fields: [
      { id: 1, name: 'departamento', value: 'Marketing' },
      { id: 2, name: 'responsable_negocio', value: 'Ana López' },
      { id: 3, name: 'funcional', value: 'Especificación_v1.2.pdf' }
    ]
  },
  {
    id: 10002,
    subject: 'Optimización de consultas de base de datos',
    description: 'Mejorar el rendimiento de las consultas SQL más utilizadas',
    project: { id: 2, name: 'Proyecto Ventas' },
    tracker: { id: 3, name: 'Bug' },
    status: { id: 2, name: 'Doing' },
    priority: { id: 3, name: 'Normal' },
    author: { id: 3, name: 'Carlos Ruiz' },
    assigned_to: { id: 4, name: 'Laura Mendez' },
    created_on: '2025-01-02T09:15:00Z',
    updated_on: '2025-01-06T11:45:00Z',
    due_date: '2025-02-20',
    done_ratio: 25,
    custom_fields: [
      { id: 1, name: 'departamento', value: 'Ventas' },
      { id: 2, name: 'responsable_negocio', value: 'Roberto Silva' },
      { id: 3, name: 'funcional', value: 'Requerimientos_DB.docx' }
    ]
  },
  {
    id: 10003,
    subject: 'Desarrollo de dashboard financiero',
    description: 'Crear dashboard interactivo para visualización de métricas financieras',
    project: { id: 3, name: 'Proyecto Finanzas' },
    tracker: { id: 2, name: 'Feature' },
    status: { id: 3, name: 'Done' },
    priority: { id: 2, name: 'Baja' },
    author: { id: 5, name: 'Elena Torres' },
    assigned_to: { id: 6, name: 'Diego Vargas' },
    created_on: '2025-01-03T14:20:00Z',
    updated_on: '2025-01-07T16:10:00Z',
    due_date: '2025-04-05',
    done_ratio: 80,
    custom_fields: [
      { id: 1, name: 'departamento', value: 'Finanzas' },
      { id: 2, name: 'responsable_negocio', value: 'Carmen Vega' },
      { id: 3, name: 'funcional', value: 'Dashboard_specs.pdf' }
    ]
  },
  {
    id: 10004,
    subject: 'Integración con API de pagos externa',
    description: 'Integrar sistema de pagos con proveedor externo',
    project: { id: 4, name: 'Proyecto Producto' },
    tracker: { id: 2, name: 'Feature' },
    status: { id: 4, name: 'To do' },
    priority: { id: 4, name: 'Alta' },
    author: { id: 7, name: 'Miguel Santos' },
    assigned_to: null,
    created_on: '2025-01-04T08:30:00Z',
    updated_on: '2025-01-04T08:30:00Z',
    due_date: null,
    done_ratio: 0,
    custom_fields: [
      { id: 1, name: 'departamento', value: 'Producto' },
      { id: 2, name: 'responsable_negocio', value: null },
      { id: 3, name: 'funcional', value: null }
    ]
  },
  {
    id: 10005,
    subject: 'Actualización del framework de frontend',
    description: 'Migrar aplicación web a la última versión del framework',
    project: { id: 1, name: 'Proyecto Marketing' },
    tracker: { id: 1, name: 'Mejora' },
    status: { id: 5, name: 'Demo' },
    priority: { id: 3, name: 'Normal' },
    author: { id: 8, name: 'Sofia Herrera' },
    assigned_to: null,
    created_on: '2025-01-05T13:45:00Z',
    updated_on: '2025-01-05T13:45:00Z',
    due_date: null,
    done_ratio: 0,
    custom_fields: [
      { id: 1, name: 'departamento', value: 'Marketing' },
      { id: 2, name: 'responsable_negocio', value: 'Pedro Morales' },
      { id: 3, name: 'funcional', value: null }
    ]
  }
];

/**
 * Simula la obtención de tareas de Redmine
 * @param {Object} filters - Filtros para la consulta
 * @param {number} offset - Desplazamiento para paginación
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Object>} Respuesta mock de Redmine
 */
const getIssues = async (filters = {}, offset = 0, limit = 25) => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 100));

  let filteredTasks = [...mockRedmineTasks];

  // Aplicar filtros
  if (filters.project_id) {
    filteredTasks = filteredTasks.filter(task => task.project.id === parseInt(filters.project_id));
  }

  if (filters.status_id) {
    if (filters.status_id === 'open') {
      filteredTasks = filteredTasks.filter(task => task.status.name !== 'Done');
    } else if (filters.status_id === 'closed') {
      filteredTasks = filteredTasks.filter(task => task.status.name === 'Done');
    } else if (typeof filters.status_id === 'string' && isNaN(parseInt(filters.status_id))) {
      // Filtrar por nombre de estado
      filteredTasks = filteredTasks.filter(task => task.status.name === filters.status_id);
    } else {
      // Filtrar por ID de estado (backwards compatibility)
      filteredTasks = filteredTasks.filter(task => task.status.id === parseInt(filters.status_id));
    }
  }

  if (filters.assigned_to_id) {
    if (filters.assigned_to_id === 'me') {
      // En un caso real, esto sería el ID del usuario autenticado
      filteredTasks = filteredTasks.filter(task => task.assigned_to && task.assigned_to.id === 2);
    } else {
      filteredTasks = filteredTasks.filter(task => task.assigned_to && task.assigned_to.id === parseInt(filters.assigned_to_id));
    }
  }

  if (filters.tracker_id) {
    filteredTasks = filteredTasks.filter(task => task.tracker.id === parseInt(filters.tracker_id));
  }

  if (filters.priority_id) {
    filteredTasks = filteredTasks.filter(task => task.priority.id === parseInt(filters.priority_id));
  }

  // Aplicar paginación
  const total = filteredTasks.length;
  const paginatedTasks = filteredTasks.slice(offset, offset + limit);

  return {
    issues: paginatedTasks,
    total_count: total,
    offset,
    limit
  };
};

/**
 * Simula la obtención de una tarea específica de Redmine
 * @param {number} issueId - ID de la tarea
 * @returns {Promise<Object>} Tarea mock de Redmine
 */
const getIssue = async (issueId) => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 50));

  const task = mockRedmineTasks.find(task => task.id === parseInt(issueId));
  
  if (!task) {
    throw new Error('Tarea no encontrada');
  }

  return {
    issue: task
  };
};

/**
 * Simula la creación de una nueva tarea en Redmine
 * @param {Object} issueData - Datos de la nueva tarea
 * @returns {Promise<Object>} Tarea creada
 */
const createIssue = async (issueData) => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 200));

  const newId = Math.max(...mockRedmineTasks.map(t => t.id)) + 1;
  
  const newTask = {
    id: newId,
    subject: issueData.subject,
    description: issueData.description || '',
    project: { id: issueData.project_id, name: `Proyecto ${issueData.project_id}` },
    tracker: { id: issueData.tracker_id || 2, name: 'Feature' },
    status: { id: 1, name: 'Backlog' },
    priority: { id: issueData.priority_id || 3, name: 'Normal' },
    author: { id: 1, name: 'Usuario Sistema' },
    assigned_to: issueData.assigned_to_id ? { id: issueData.assigned_to_id, name: 'Usuario Asignado' } : null,
    created_on: new Date().toISOString(),
    updated_on: new Date().toISOString(),
    due_date: issueData.due_date || null,
    done_ratio: 0,
    custom_fields: [
      { id: 1, name: 'departamento', value: issueData.departamento || null },
      { id: 2, name: 'responsable_negocio', value: issueData.responsable_negocio || null },
      { id: 3, name: 'funcional', value: issueData.funcional || null }
    ]
  };

  // Agregar la nueva tarea al mock
  mockRedmineTasks.push(newTask);

  return {
    issue: newTask
  };
};

/**
 * Simula la actualización de una tarea en Redmine
 * @param {number} issueId - ID de la tarea
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<boolean>} Éxito de la actualización
 */
const updateIssue = async (issueId, updateData) => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 150));

  const taskIndex = mockRedmineTasks.findIndex(task => task.id === parseInt(issueId));
  
  if (taskIndex === -1) {
    throw new Error('Tarea no encontrada');
  }

  // Actualizar campos básicos
  if (updateData.subject) mockRedmineTasks[taskIndex].subject = updateData.subject;
  if (updateData.description) mockRedmineTasks[taskIndex].description = updateData.description;
  if (updateData.status_id) mockRedmineTasks[taskIndex].status.id = updateData.status_id;
  if (updateData.priority_id) mockRedmineTasks[taskIndex].priority.id = updateData.priority_id;
  if (updateData.assigned_to_id) {
    mockRedmineTasks[taskIndex].assigned_to = { id: updateData.assigned_to_id, name: 'Usuario Actualizado' };
  }
  if (updateData.due_date) mockRedmineTasks[taskIndex].due_date = updateData.due_date;

  mockRedmineTasks[taskIndex].updated_on = new Date().toISOString();

  return true;
};

/**
 * Simula la eliminación de una tarea en Redmine
 * @param {number} issueId - ID de la tarea
 * @returns {Promise<boolean>} Éxito de la eliminación
 */
const deleteIssue = async (issueId) => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 100));

  const taskIndex = mockRedmineTasks.findIndex(task => task.id === parseInt(issueId));
  
  if (taskIndex === -1) {
    throw new Error('Tarea no encontrada');
  }

  mockRedmineTasks.splice(taskIndex, 1);
  return true;
};

module.exports = {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
}; 