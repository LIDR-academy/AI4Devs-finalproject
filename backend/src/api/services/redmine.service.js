/**
 * Servicio para interactuar con la API de Redmine
 */
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Configuración base para la API de Redmine
const redmineAPI = axios.create({
  baseURL: process.env.REDMINE_API_URL || 'http://localhost:5000',
  headers: {
    'X-Redmine-API-Key': process.env.REDMINE_API_KEY,
    'Content-Type': 'application/json'
  }
});

/**
 * Servicio para interactuar con Redmine
 */
class RedmineService {
  /**
   * Obtiene todas las tareas (issues) con opciones de filtrado
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} Lista de tareas, total y metadatos
   */
  async listIssues(options = {}) {
    try {
      const response = await redmineAPI.get('/issues.json', { params: options });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Obtiene una tarea específica por su ID
   * @param {number} issueId - ID de la tarea
   * @param {Object} options - Opciones adicionales (include)
   * @returns {Promise<Object>} Detalles de la tarea
   */
  async getIssue(issueId, options = {}) {
    try {
      const response = await redmineAPI.get(`/issues/${issueId}.json`, { params: options });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Crea una nueva tarea en Redmine
   * @param {Object} issueData - Datos de la tarea a crear
   * @returns {Promise<Object>} Tarea creada
   */
  async createIssue(issueData) {
    try {
      const response = await redmineAPI.post('/issues.json', { issue: issueData });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Actualiza una tarea existente
   * @param {number} issueId - ID de la tarea
   * @param {Object} issueData - Datos a actualizar
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  async updateIssue(issueId, issueData) {
    try {
      await redmineAPI.put(`/issues/${issueId}.json`, { issue: issueData });
      return true;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Elimina una tarea
   * @param {number} issueId - ID de la tarea
   * @returns {Promise<boolean>} True si la eliminación fue exitosa
   */
  async deleteIssue(issueId) {
    try {
      await redmineAPI.delete(`/issues/${issueId}.json`);
      return true;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Obtiene los proyectos de Redmine
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} Lista de proyectos
   */
  async listProjects(options = {}) {
    try {
      const response = await redmineAPI.get('/projects.json', { params: options });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Obtiene un proyecto específico
   * @param {string} projectId - ID o identificador del proyecto
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Detalles del proyecto
   */
  async getProject(projectId, options = {}) {
    try {
      const response = await redmineAPI.get(`/projects/${projectId}.json`, { params: options });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Obtiene los usuarios de Redmine
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} Lista de usuarios
   */
  async listUsers(options = {}) {
    try {
      const response = await redmineAPI.get('/users.json', { params: options });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Obtiene el usuario actual
   * @returns {Promise<Object>} Información del usuario actual
   */
  async getCurrentUser() {
    try {
      const response = await redmineAPI.get('/users/current.json');
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Obtiene todos los estados disponibles en Redmine
   * @returns {Promise<Object>} Lista de estados de issues
   */
  async listIssueStatuses() {
    try {
      const response = await redmineAPI.get('/issue_statuses.json');
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Buscar tareas con criterios específicos y sincronizarlas con TaskDistributor
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} prisma - Instancia de Prisma Client
   * @returns {Promise<Array>} Tareas sincronizadas
   */
  async syncIssuesWithTaskDistributor(criteria, prisma) {
    try {
      // Obtener tareas de Redmine según los criterios
      const redmineIssues = await this.listIssues(criteria);
      const syncedTasks = [];

      // Para cada tarea de Redmine, crear o actualizar su equivalente en TaskDistributor
      for (const issue of redmineIssues.issues) {
        // Verificar si la tarea ya existe en TaskDistributor
        let tareaExtended = await prisma.tareaExtended.findUnique({
          where: { redmineTaskId: issue.id }
        });

        if (!tareaExtended) {
          // Si no existe, crearla
          tareaExtended = await prisma.tareaExtended.create({
            data: {
              redmineTaskId: issue.id,
              factorCarga: 1.0, // Valor por defecto
            }
          });
        }

        syncedTasks.push({
          id: tareaExtended.id,
          redmineId: issue.id,
          subject: issue.subject,
          status: issue.status ? issue.status.name : null,
          priority: issue.priority ? issue.priority.name : null,
          assignedTo: issue.assigned_to ? issue.assigned_to.name : null,
          factorCarga: tareaExtended.factorCarga,
          estimacionSprints: tareaExtended.estimacionSprints,
          ordenPrioridad: tareaExtended.ordenPrioridad
        });
      }

      return syncedTasks;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Actualiza una tarea en Redmine y en TaskDistributor
   * @param {number} redmineTaskId - ID de la tarea en Redmine
   * @param {Object} redmineData - Datos para actualizar en Redmine
   * @param {Object} tareaData - Datos para actualizar en TaskDistributor
   * @param {Object} prisma - Instancia de Prisma Client
   * @returns {Promise<Object>} Tarea actualizada
   */
  async updateTaskWithRedmine(redmineTaskId, redmineData, tareaData, prisma) {
    try {
      // Iniciar transacción para garantizar consistencia
      return await prisma.$transaction(async (tx) => {
        // Verificar si la tarea existe en TaskDistributor
        const tareaExtended = await tx.tareaExtended.findUnique({
          where: { redmineTaskId }
        });

        if (!tareaExtended) {
          throw new Error(`Tarea con redmineTaskId ${redmineTaskId} no encontrada`);
        }

        // Actualizar en Redmine
        if (Object.keys(redmineData).length > 0) {
          await this.updateIssue(redmineTaskId, redmineData);
        }

        // Actualizar en TaskDistributor
        if (Object.keys(tareaData).length > 0) {
          // Si hay cambios en estimación, guardar historial
          if (tareaData.estimacionSprints !== undefined && 
              tareaData.estimacionSprints !== tareaExtended.estimacionSprints) {
            await tx.historialEstimacion.create({
              data: {
                tareaId: tareaExtended.id,
                estimacionAnterior: tareaExtended.estimacionSprints,
                estimacionNueva: tareaData.estimacionSprints,
                factorCargaAnterior: tareaExtended.factorCarga,
                factorCargaNueva: tareaData.factorCarga || tareaExtended.factorCarga,
                usuarioId: tareaData.usuarioId,
                fechaCambio: new Date()
              }
            });
          }

          // Actualizar la tarea
          await tx.tareaExtended.update({
            where: { id: tareaExtended.id },
            data: tareaData
          });
        }

        // Obtener la tarea actualizada de Redmine
        const updatedRedmineIssue = await this.getIssue(redmineTaskId);
        
        // Obtener la tarea actualizada de TaskDistributor
        const updatedTareaExtended = await tx.tareaExtended.findUnique({
          where: { id: tareaExtended.id }
        });

        // Combinar la información
        return {
          id: updatedTareaExtended.id,
          redmineTaskId,
          redmineData: updatedRedmineIssue.issue,
          factorCarga: updatedTareaExtended.factorCarga,
          estimacionSprints: updatedTareaExtended.estimacionSprints,
          ordenPrioridad: updatedTareaExtended.ordenPrioridad,
          fechaInicioPlanificada: updatedTareaExtended.fechaInicioPlanificada,
          fechaFinPlanificada: updatedTareaExtended.fechaFinPlanificada,
        };
      });
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Maneja los errores de la API
   * @param {Error} error - Error de la API
   * @throws {Error} Error formateado
   */
  handleApiError(error) {
    if (error.response) {
      // La solicitud fue realizada y el servidor respondió con un código de estado fuera del rango 2xx
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      let message = `Error de Redmine (${statusCode})`;
      if (errorData && errorData.errors) {
        message += `: ${errorData.errors.join(', ')}`;
      }
      
      const formattedError = new Error(message);
      formattedError.statusCode = statusCode;
      formattedError.details = errorData;
      throw formattedError;
    } else if (error.request) {
      // La solicitud fue realizada pero no se recibió respuesta
      throw new Error('No se recibió respuesta del servidor de Redmine');
    } else {
      // Algo ocurrió durante la configuración de la solicitud
      throw new Error(`Error en la configuración de la solicitud: ${error.message}`);
    }
  }
}

module.exports = new RedmineService(); 