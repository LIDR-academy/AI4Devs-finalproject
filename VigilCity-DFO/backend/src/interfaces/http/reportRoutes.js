const express = require('express');
const { createReport, deleteReport, getReports, getReportById } = require('../../infrastructure/controllers/reportController');
const { validateReport } = require('../validation/reportValidator');
const authMiddleware = require('../../middleware/authMiddleware'); // Importar el middleware

const router = express.Router();

router.post('/reportes', authMiddleware, validateReport, createReport);
router.get('/reportes', getReports); // Ruta para consultar reportes
router.get('/reportes/:id', getReportById); // Ruta para obtener un reporte por ID
router.delete('/reportes/:id', authMiddleware, deleteReport); // Ruta para eliminar reportes

module.exports = router;
