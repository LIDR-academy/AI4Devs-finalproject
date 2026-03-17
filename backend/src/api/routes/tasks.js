const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const taskController = require('../controllers/taskController');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

/**
 * Obtener tareas con filtros, paginación y búsqueda
 * GET /api/tasks
 */
router.get('/', taskController.getTasks);

/**
 * Obtener una tarea por ID
 * GET /api/tasks/:id
 */
router.get('/:id', taskController.getTaskById);

/**
 * Actualizar estimación de una tarea
 * PUT /api/tasks/:id/estimation
 */
router.put('/:id/estimation', taskController.updateTaskEstimation);

/**
 * Obtener estadísticas de tareas
 * GET /api/tasks/stats
 */
router.get('/stats', taskController.getTaskStats);

module.exports = router; 