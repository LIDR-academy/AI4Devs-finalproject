const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * Rutas para tareas - US-08-02: Sistema de filtros avanzados
 * Todas las rutas requieren autenticación
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la tarea en Redmine
 *         subject:
 *           type: string
 *           description: Asunto de la tarea
 *         description:
 *           type: string
 *           description: Descripción detallada
 *         status:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         priority:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         departamento:
 *           type: string
 *           description: Departamento de negocio
 *         responsable_negocio:
 *           type: string
 *           description: Responsable de negocio asignado
 *         funcional:
 *           type: string
 *           description: Documento funcional asociado
 *         orden_prioridad:
 *           type: integer
 *           description: Orden en el backlog
 *         factor_carga:
 *           type: number
 *           description: Factor de carga de trabajo
 *         estimacion_sprints:
 *           type: integer
 *           description: Estimación en sprints
 *         fecha_inicio_planificada:
 *           type: string
 *           format: date
 *         fecha_fin_planificada:
 *           type: string
 *           format: date
 *         equipo_asignado:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             tipo:
 *               type: string
 *               enum: [INTERNO, EXTERNO]
 *         etapa:
 *           type: string
 *           enum: [sin_planificar, planificada, en_curso, finalizada]
 *         tiene_responsable:
 *           type: boolean
 *         tiene_funcional:
 *           type: boolean
 *         esta_planificada:
 *           type: boolean
 *         tiene_equipo_asignado:
 *           type: boolean
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtener tareas con filtros avanzados
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por texto en título, descripción, etc.
 *       - in: query
 *         name: departamento
 *         schema:
 *           type: string
 *         description: Filtro por departamento
 *       - in: query
 *         name: status_id
 *         schema:
 *           type: string
 *         description: Filtro por estado (ID o 'open'/'closed')
 *       - in: query
 *         name: priority_id
 *         schema:
 *           type: integer
 *         description: Filtro por prioridad
 *       - in: query
 *         name: equipo_id
 *         schema:
 *           type: integer
 *         description: Filtro por equipo asignado
 *       - in: query
 *         name: etapa
 *         schema:
 *           type: string
 *           enum: [sin_planificar, planificada, en_curso, finalizada]
 *         description: Filtro por etapa
 *       - in: query
 *         name: responsable_negocio
 *         schema:
 *           type: string
 *         description: Filtro por responsable de negocio
 *       - in: query
 *         name: pendientes_planificar
 *         schema:
 *           type: boolean
 *         description: Solo tareas pendientes de planificar
 *       - in: query
 *         name: fecha_inicio_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio desde
 *       - in: query
 *         name: fecha_inicio_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio hasta
 *       - in: query
 *         name: fecha_fin_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin desde
 *       - in: query
 *         name: fecha_fin_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin hasta
 *       - in: query
 *         name: estimacion_sprints_min
 *         schema:
 *           type: integer
 *         description: Estimación mínima en sprints
 *       - in: query
 *         name: estimacion_sprints_max
 *         schema:
 *           type: integer
 *         description: Estimación máxima en sprints
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [subject, priority, status, created_on, updated_on, due_date, orden_prioridad, estimacion_sprints]
 *         description: Campo de ordenamiento
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Orden de clasificación
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Desplazamiento para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de tareas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         current_page:
 *                           type: integer
 *                 filters_applied:
 *                   type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticate, taskController.getTasks);

/**
 * @swagger
 * /api/tasks/stats:
 *   get:
 *     summary: Obtener estadísticas de tareas para KPIs
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departamento
 *         schema:
 *           type: string
 *         description: Filtro por departamento para las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_tareas:
 *                       type: integer
 *                     por_etapa:
 *                       type: object
 *                     por_estado:
 *                       type: object
 *                     por_prioridad:
 *                       type: object
 *                     problematicas:
 *                       type: object
 *                     estimacion:
 *                       type: object
 *                     por_departamento:
 *                       type: object
 *                     por_equipo:
 *                       type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/stats', authenticate, taskController.getTaskStats);

/**
 * @swagger
 * /api/tasks/filter-options:
 *   get:
 *     summary: Obtener opciones disponibles para filtros dinámicos
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Opciones de filtro obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     departamentos:
 *                       type: array
 *                       items:
 *                         type: string
 *                     responsables_negocio:
 *                       type: array
 *                       items:
 *                         type: string
 *                     equipos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                     estados:
 *                       type: array
 *                       items:
 *                         type: string
 *                     prioridades:
 *                       type: array
 *                       items:
 *                         type: string
 *                     proyectos:
 *                       type: array
 *                       items:
 *                         type: string
 *                     etapas:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/filter-options', authenticate, taskController.getFilterOptions);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtener una tarea específica por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la tarea
 *     responses:
 *       200:
 *         description: Tarea obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: ID de tarea inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticate, taskController.getTaskById);

/**
 * @swagger
 * /api/tasks/{id}/estimation:
 *   put:
 *     summary: Actualizar estimación de una tarea (solo tecnología)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estimacion_sprints
 *               - factor_carga
 *             properties:
 *               estimacion_sprints:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 50
 *                 description: Estimación en sprints (puede ser decimal)
 *               factor_carga:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 20
 *                 description: Factor de carga de trabajo
 *     responses:
 *       200:
 *         description: Estimación actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos (solo tecnología)
 *       404:
 *         description: Tarea no encontrada
 *       422:
 *         description: Tarea no se puede estimar en su estado actual
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/estimation', authenticate, authorize(['TECNOLOGIA']), taskController.updateTaskEstimation);

/**
 * @swagger
 * /api/tasks/{id}/recommendations:
 *   get:
 *     summary: Obtener recomendaciones de equipos para una tarea (solo tecnología)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la tarea
 *     responses:
 *       200:
 *         description: Recomendaciones obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       teamId:
 *                         type: integer
 *                       teamName:
 *                         type: string
 *                       isExternal:
 *                         type: boolean
 *                       currentLoad:
 *                         type: number
 *                       capacity:
 *                         type: number
 *                       affinity:
 *                         type: integer
 *                       possibleStartDate:
 *                         type: string
 *                         format: date
 *                       possibleEndDate:
 *                         type: string
 *                         format: date
 *                       recommendationScore:
 *                         type: number
 *                       currentProjects:
 *                         type: array
 *                         items:
 *                           type: object
 *       400:
 *         description: ID de tarea inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos (solo tecnología)
 *       404:
 *         description: Tarea no encontrada
 *       422:
 *         description: Tarea no se puede planificar
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/recommendations', authenticate, authorize(['TECNOLOGIA']), taskController.getTeamRecommendations);

/**
 * @swagger
 * /api/tasks/{id}/assignment:
 *   put:
 *     summary: Asignar equipo y fechas a una tarea (solo tecnología)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - equipo_id
 *               - fecha_inicio
 *               - fecha_fin
 *             properties:
 *               equipo_id:
 *                 type: integer
 *                 description: ID del equipo asignado
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio planificada
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin planificada
 *     responses:
 *       200:
 *         description: Tarea asignada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos (solo tecnología)
 *       404:
 *         description: Tarea o equipo no encontrado
 *       422:
 *         description: Tarea no se puede planificar
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/assignment', authenticate, authorize(['TECNOLOGIA']), taskController.assignTeamAndDates);

module.exports = router; 