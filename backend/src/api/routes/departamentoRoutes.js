const express = require('express');
const departamentoController = require('../controllers/departamentoController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

/**
 * Rutas para departamentos
 * Todas las rutas requieren autenticación
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Departamento:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del departamento
 *         nombre:
 *           type: string
 *           description: Nombre del departamento
 *         descripcion:
 *           type: string
 *           description: Descripción del departamento
 *         activo:
 *           type: boolean
 *           description: Estado activo del departamento
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
 * /api/departamentos:
 *   get:
 *     summary: Obtener todos los departamentos
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtro por estado activo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o descripción
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [nombre, createdAt]
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
 *         description: Lista de departamentos obtenida correctamente
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
 *                         $ref: '#/components/schemas/Departamento'
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
 * /api/departamentos/{id}:
 *   get:
 *     summary: Obtener un departamento por ID
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento
 *     responses:
 *       200:
 *         description: Departamento obtenido correctamente
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
 *                   $ref: '#/components/schemas/Departamento'
 *       400:
 *         description: ID de departamento inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Departamento no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/departamentos/stats:
 *   get:
 *     summary: Obtener estadísticas de departamentos
 *     tags: [Departamentos]
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
 *                     total_departamentos:
 *                       type: integer
 *                     departamentos_activos:
 *                       type: integer
 *                     departamentos_inactivos:
 *                       type: integer
 *                     top_departamentos_con_afinidades:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                           total_afinidades:
 *                             type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get('/stats', departamentoController.getDepartamentoStats);

// Rutas generales
router.get('/', departamentoController.getDepartamentos);
router.get('/:id', departamentoController.getDepartamentoById);

module.exports = router; 