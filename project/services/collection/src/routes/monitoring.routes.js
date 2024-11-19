const express = require('express');
const router = express.Router();
const MonitoringController = require('../controllers/monitoringController');

/**
 * @swagger
 * /collection/monitoring/metrics:
 *   get:
 *     summary: Obtiene métricas generales de recaudación
 *     tags: [Monitoreo]
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial del período
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final del período
 *     responses:
 *       200:
 *         description: Métricas de recaudación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_pagos:
 *                   type: integer
 *                 monto_total_recaudado:
 *                   type: number
 *                 promedio_pago:
 *                   type: number
 *                 contribuyentes_pagadores:
 *                   type: integer
 *                 total_contribuyentes_deuda:
 *                   type: integer
 *                 monto_total_deuda:
 *                   type: number
 */
router.get('/metrics', MonitoringController.getCollectionMetrics);

/**
 * @swagger
 * /collection/monitoring/strategy-effectiveness:
 *   get:
 *     summary: Obtiene la efectividad de las estrategias de cobro
 *     tags: [Monitoreo]
 *     responses:
 *       200:
 *         description: Efectividad de las estrategias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   estrategia:
 *                     type: string
 *                   nivel_probabilidad:
 *                     type: string
 *                   total_acciones:
 *                     type: integer
 *                   pagos_realizados:
 *                     type: integer
 *                   monto_recaudado:
 *                     type: number
 *                   tasa_efectividad:
 *                     type: number
 */
router.get('/strategy-effectiveness', MonitoringController.getStrategyEffectiveness);

/**
 * @swagger
 * /collection/monitoring/notification-effectiveness:
 *   get:
 *     summary: Obtiene la efectividad de las notificaciones
 *     tags: [Monitoreo]
 *     responses:
 *       200:
 *         description: Efectividad de las notificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tipo_notificacion:
 *                     type: string
 *                   total_enviadas:
 *                     type: integer
 *                   entregadas:
 *                     type: integer
 *                   resultaron_en_pago:
 *                     type: integer
 *                   promedio_pago:
 *                     type: number
 *                   tasa_conversion:
 *                     type: number
 */
router.get('/notification-effectiveness', MonitoringController.getNotificationEffectiveness);

/**
 * @swagger
 * /collection/monitoring/trends:
 *   get:
 *     summary: Obtiene tendencias de recaudación
 *     tags: [Monitoreo]
 *     responses:
 *       200:
 *         description: Tendencias de recaudación mensuales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mes:
 *                     type: string
 *                     format: date
 *                   total_pagos:
 *                     type: integer
 *                   monto_total:
 *                     type: number
 *                   contribuyentes_unicos:
 *                     type: integer
 */
router.get('/trends', MonitoringController.getCollectionTrends);

module.exports = router;
