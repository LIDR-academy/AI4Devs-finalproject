/**
 * Rutas para la interacción con Redmine
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const redmineController = require('../controllers/redmine.controller');

/**
 * @swagger
 * /api/redmine/issues:
 *   get:
 *     summary: Obtener todas las tareas de Redmine
 *     tags: [Redmine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Desplazamiento para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Campo por el que ordenar
 *       - in: query
 *         name: status_id
 *         schema:
 *           type: string
 *         description: Filtro por estado
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *         description: Filtro por proyecto
 *     responses:
 *       200:
 *         description: Lista de tareas obtenida correctamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/issues', protect, redmineController.getIssues);

/**
 * @swagger
 * /api/redmine/issues/{id}:
 *   get:
 *     summary: Obtener una tarea específica de Redmine
 *     tags: [Redmine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Datos adicionales a incluir
 *     responses:
 *       200:
 *         description: Tarea obtenida correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/issues/:id', protect, redmineController.getIssue);

/**
 * @swagger
 * /api/redmine/issues:
 *   post:
 *     summary: Crear una nueva tarea en Redmine
 *     tags: [Redmine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - subject
 *             properties:
 *               project_id:
 *                 type: integer
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               status_id:
 *                 type: integer
 *               priority_id:
 *                 type: integer
 *               assigned_to_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tarea creada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/issues', protect, redmineController.createIssue);

/**
 * @swagger
 * /api/redmine/issues/{id}:
 *   put:
 *     summary: Actualizar una tarea existente en Redmine
 *     tags: [Redmine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               status_id:
 *                 type: integer
 *               priority_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tarea actualizada correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/issues/:id', protect, redmineController.updateIssue);

/**
 * @swagger
 * /api/redmine/issues/{id}:
 *   delete:
 *     summary: Eliminar una tarea de Redmine
 *     tags: [Redmine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea eliminada correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/issues/:id', protect, redmineController.deleteIssue);

/**
 * @swagger
 * /api/redmine/projects:
 *   get:
 *     summary: Obtener proyectos de Redmine
 *     tags: [Redmine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Desplazamiento para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de proyectos obtenida correctamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/projects', protect, redmineController.getProjects);

/**
 * @swagger
 * /api/redmine/users:
 *   get:
 *     summary: Obtener usuarios de Redmine
 *     tags: [Redmine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Desplazamiento para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Filtro por estado (1=activo, 2=registrado, 3=bloqueado)
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/users', protect, redmineController.getUsers);

/**
 * @swagger
 * /api/redmine/users/current:
 *   get:
 *     summary: Obtener usuario actual de Redmine
 *     tags: [Redmine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario actual obtenido correctamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/users/current', protect, redmineController.getCurrentUser);

/**
 * @swagger
 * /api/redmine/sync:
 *   post:
 *     summary: Sincronizar tareas de Redmine con TaskDistributor
 *     tags: [Redmine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               criteria:
 *                 type: object
 *                 properties:
 *                   project_id:
 *                     type: integer
 *                   status_id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Tareas sincronizadas correctamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/sync', protect, redmineController.syncIssues);

/**
 * @swagger
 * /api/redmine/tasks/{id}:
 *   put:
 *     summary: Actualizar una tarea en Redmine y TaskDistributor
 *     tags: [Redmine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea en Redmine
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               redmineData:
 *                 type: object
 *                 properties:
 *                   subject:
 *                     type: string
 *                   status_id:
 *                     type: integer
 *                   priority_id:
 *                     type: integer
 *                   assigned_to_id:
 *                     type: integer
 *               tareaData:
 *                 type: object
 *                 properties:
 *                   factorCarga:
 *                     type: number
 *                   estimacionSprints:
 *                     type: integer
 *                   ordenPrioridad:
 *                     type: integer
 *                   fechaInicioPlanificada:
 *                     type: string
 *                     format: date
 *                   fechaFinPlanificada:
 *                     type: string
 *                     format: date
 *     responses:
 *       200:
 *         description: Tarea actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/tasks/:id', protect, redmineController.updateTask);

module.exports = router; 