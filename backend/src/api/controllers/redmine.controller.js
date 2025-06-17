/**
 * Controlador para gestionar las operaciones con Redmine
 */
const redmineService = require('../services/redmine.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @desc    Obtener todas las tareas de Redmine
 * @route   GET /api/redmine/issues
 * @access  Privado
 */
exports.getIssues = async (req, res) => {
  try {
    // Extraer parámetros de consulta
    const { offset, limit, sort, status_id, project_id } = req.query;
    
    // Construir opciones para la búsqueda en Redmine
    const options = {};
    if (offset) options.offset = offset;
    if (limit) options.limit = limit;
    if (sort) options.sort = sort;
    if (status_id) options.status_id = status_id;
    if (project_id) options.project_id = project_id;
    
    const issues = await redmineService.listIssues(options);
    
    res.status(200).json({
      success: true,
      data: issues
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Obtener una tarea específica de Redmine
 * @route   GET /api/redmine/issues/:id
 * @access  Privado
 */
exports.getIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { include } = req.query;
    
    const options = {};
    if (include) options.include = include;
    
    const issue = await redmineService.getIssue(id, options);
    
    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Crear una nueva tarea en Redmine
 * @route   POST /api/redmine/issues
 * @access  Privado
 */
exports.createIssue = async (req, res) => {
  try {
    const issueData = req.body;
    
    // Validar datos mínimos requeridos
    if (!issueData.project_id || !issueData.subject) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere project_id y subject para crear una tarea'
      });
    }
    
    const createdIssue = await redmineService.createIssue(issueData);
    
    // Crear la tarea extendida en TaskDistributor
    await prisma.tareaExtended.create({
      data: {
        redmineTaskId: createdIssue.issue.id,
        factorCarga: 1.0 // Valor por defecto
      }
    });
    
    res.status(201).json({
      success: true,
      data: createdIssue
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar una tarea existente en Redmine
 * @route   PUT /api/redmine/issues/:id
 * @access  Privado
 */
exports.updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issueData = req.body;
    
    const updated = await redmineService.updateIssue(id, issueData);
    
    res.status(200).json({
      success: true,
      data: { updated }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar una tarea de Redmine
 * @route   DELETE /api/redmine/issues/:id
 * @access  Privado
 */
exports.deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primero verificamos si existe en TaskDistributor
    const tareaExtended = await prisma.tareaExtended.findUnique({
      where: { redmineTaskId: parseInt(id) }
    });
    
    // Eliminar de Redmine
    const deleted = await redmineService.deleteIssue(id);
    
    // Si existe en TaskDistributor, eliminarla también
    if (tareaExtended) {
      await prisma.tareaExtended.delete({
        where: { id: tareaExtended.id }
      });
    }
    
    res.status(200).json({
      success: true,
      data: { deleted }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Obtener proyectos de Redmine
 * @route   GET /api/redmine/projects
 * @access  Privado
 */
exports.getProjects = async (req, res) => {
  try {
    const { offset, limit } = req.query;
    
    const options = {};
    if (offset) options.offset = offset;
    if (limit) options.limit = limit;
    
    const projects = await redmineService.listProjects(options);
    
    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Obtener usuarios de Redmine
 * @route   GET /api/redmine/users
 * @access  Privado
 */
exports.getUsers = async (req, res) => {
  try {
    const { offset, limit, status } = req.query;
    
    const options = {};
    if (offset) options.offset = offset;
    if (limit) options.limit = limit;
    if (status) options.status = status;
    
    const users = await redmineService.listUsers(options);
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Obtener usuario actual de Redmine
 * @route   GET /api/redmine/users/current
 * @access  Privado
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const currentUser = await redmineService.getCurrentUser();
    
    res.status(200).json({
      success: true,
      data: currentUser
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Sincronizar tareas de Redmine con TaskDistributor
 * @route   POST /api/redmine/sync
 * @access  Privado
 */
exports.syncIssues = async (req, res) => {
  try {
    const criteria = req.body.criteria || {};
    
    const syncedTasks = await redmineService.syncIssuesWithTaskDistributor(criteria, prisma);
    
    res.status(200).json({
      success: true,
      count: syncedTasks.length,
      data: syncedTasks
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar una tarea en Redmine y TaskDistributor
 * @route   PUT /api/redmine/tasks/:id
 * @access  Privado
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { redmineData, tareaData } = req.body;
    
    // Validar que se proporcionan datos para al menos un sistema
    if (!redmineData && !tareaData) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere proporcionar datos para actualizar en Redmine y/o TaskDistributor'
      });
    }
    
    const updatedTask = await redmineService.updateTaskWithRedmine(
      parseInt(id),
      redmineData || {},
      tareaData || {},
      prisma
    );
    
    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
}; 