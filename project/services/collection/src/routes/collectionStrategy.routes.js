const express = require('express');
const router = express.Router();
const CollectionStrategyController = require('../controllers/collectionStrategyController');

/**
 * @swagger
 * /collection:
 *   get:
 *     summary: Obtiene información general de la API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Información exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 endpoints:
 *                   type: object
 */
router.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a la API de Gestión de Cobro',
        endpoints: {
            estrategias: '/strategies',
            notificaciones: '/notifications',
            incentivos: '/incentives',
            accionesLegales: '/legal',
            monitoreo: '/monitoring'
        }
    });
});

/**
 * @swagger
 * /collection/strategies:
 *   post:
 *     summary: Crea una nueva estrategia de cobro
 *     tags: [Estrategias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clasificacion_id
 *               - nombre
 *             properties:
 *               clasificacion_id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Estrategia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estrategia'
 */
router.post('/strategies', CollectionStrategyController.createStrategy);

/**
 * @swagger
 * /collection/strategies/level/{nivel}:
 *   get:
 *     summary: Obtiene estrategias por nivel de probabilidad
 *     tags: [Estrategias]
 *     parameters:
 *       - in: path
 *         name: nivel
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ALTO, MEDIO, BAJO]
 *     responses:
 *       200:
 *         description: Lista de estrategias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Estrategia'
 */
router.get('/strategies/level/:nivel', CollectionStrategyController.getStrategiesByLevel);

// Rutas para acciones de cobro
router.post('/actions', CollectionStrategyController.createAction);
router.get('/actions/strategy/:estrategiaId', CollectionStrategyController.getActions);

/**
 * @swagger
 * /collection/contributor/{contribuyenteId}/classification:
 *   get:
 *     summary: Obtiene la clasificación de un contribuyente
 *     tags: [Contribuyentes]
 *     parameters:
 *       - in: path
 *         name: contribuyenteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contribuyente
 *     responses:
 *       200:
 *         description: Clasificación del contribuyente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contribuyente_id:
 *                   type: integer
 *                 contribuyente_nombre:
 *                   type: string
 *                 identificacion:
 *                   type: string
 *                 clasificacion_id:
 *                   type: integer
 *                 nivel_probabilidad:
 *                   type: string
 *                   enum: [ALTO, MEDIO, BAJO]
 *                 clasificacion_descripcion:
 *                   type: string
 *                 fecha_clasificacion:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: No se encontró clasificación para el contribuyente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/contributor/:contribuyenteId/classification', 
    CollectionStrategyController.getContributorClassification);

/**
 * @swagger
 * /collection/contributor/{contribuyenteId}/strategies:
 *   get:
 *     summary: Obtiene las estrategias de cobro asociadas a un contribuyente
 *     tags: [Contribuyentes]
 *     parameters:
 *       - in: path
 *         name: contribuyenteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contribuyente
 *     responses:
 *       200:
 *         description: Lista de estrategias asociadas al contribuyente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   contribuyente_id:
 *                     type: integer
 *                   contribuyente_nombre:
 *                     type: string
 *                   nivel_probabilidad:
 *                     type: string
 *                     enum: [ALTO, MEDIO, BAJO]
 *                   estrategia_id:
 *                     type: integer
 *                   estrategia_nombre:
 *                     type: string
 *                   estrategia_descripcion:
 *                     type: string
 *       404:
 *         description: No se encontraron estrategias para el contribuyente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/contributor/:contribuyenteId/strategies', 
    CollectionStrategyController.getContributorStrategies);

module.exports = router;