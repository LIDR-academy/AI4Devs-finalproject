const express = require('express');
const equipoController = require('../controllers/equipoController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

/**
 * Rutas para equipos
 * Todas las rutas requieren autenticación
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Equipo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del equipo
 *         nombre:
 *           type: string
 *           description: Nombre del equipo
 *         tipo:
 *           type: string
 *           enum: [INTERNO, EXTERNO]
 *           description: Tipo de equipo
 *         capacidad:
 *           type: number
 *           description: Capacidad de trabajo del equipo
 *         activo:
 *           type: boolean
 *           description: Estado activo del equipo
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

/**
 * @swagger
 * /api/equipos:
 *   get:
 *     summary: Obtener todos los equipos
 *     tags: [Equipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [INTERNO, EXTERNO]
 *         description: Filtro por tipo de equipo
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtro por estado activo
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [nombre, tipo, capacidad, createdAt]
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
 *         description: Lista de equipos obtenida correctamente
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
 *                     equipos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Equipo'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/equipos/{id}:
 *   get:
 *     summary: Obtener un equipo por ID
 *     tags: [Equipos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del equipo
 *     responses:
 *       200:
 *         description: Equipo obtenido correctamente
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
 *                   $ref: '#/components/schemas/Equipo'
 *       400:
 *         description: ID de equipo inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Equipo no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/equipos/stats:
 *   get:
 *     summary: Obtener estadísticas de equipos
 *     tags: [Equipos]
 *     security:
 *       - bearerAuth: []
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
 *                     total_equipos:
 *                       type: integer
 *                     equipos_internos:
 *                       type: integer
 *                     equipos_externos:
 *                       type: integer
 *                     equipos_activos:
 *                       type: integer
 *                     equipos_inactivos:
 *                       type: integer
 *                     por_tipo:
 *                       type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/equipos/capacidad:
 *   get:
 *     summary: Obtener capacidad y carga actual de todos los equipos
 *     tags: [Equipos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Capacidad de equipos obtenida correctamente
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
 *                     equipos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                           tipo:
 *                             type: string
 *                           capacidadTotal:
 *                             type: number
 *                           cargaActual:
 *                             type: number
 *                           disponibilidad:
 *                             type: number
 *                           porcentajeOcupacion:
 *                             type: integer
 *                           estadoSobrecarga:
 *                             type: string
 *                             enum: [normal, advertencia, critico]
 *                           proximaFechaDisponible:
 *                             type: string
 *                             format: date-time
 *                           totalTareasAsignadas:
 *                             type: integer
 *                           tareasActuales:
 *                             type: array
 *                             items:
 *                               type: object
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         totalEquipos:
 *                           type: integer
 *                         equiposSobrecargados:
 *                           type: integer
 *                         equiposEnAdvertencia:
 *                           type: integer
 *                         equiposDisponibles:
 *                           type: integer
 *                         capacidadTotalSistema:
 *                           type: number
 *                         cargaTotalSistema:
 *                           type: number
 *                     fechaConsulta:
 *                       type: string
 *                       format: date-time
 *                     periodoAnalisis:
 *                       type: object
 *                       properties:
 *                         desde:
 *                           type: string
 *                           format: date-time
 *                         hasta:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get('/stats', equipoController.getEquipoStats);
router.get('/capacidad', equipoController.getCapacidadEquipos);

// Rutas generales
router.get('/', equipoController.getEquipos);
router.get('/:id', equipoController.getEquipoById);

module.exports = router; 