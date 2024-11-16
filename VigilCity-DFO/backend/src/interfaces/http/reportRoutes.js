const express = require('express');
const { createReport, deleteReport, getReports } = require('../../infrastructure/controllers/reportController');
const { validateReport } = require('../validation/reportValidator');
const authMiddleware = require('../../middleware/authMiddleware'); // Importar el middleware

const router = express.Router();

router.post('/reportes', authMiddleware, validateReport, createReport);
router.get('/reportes', getReports); // Nueva ruta para consultar reportes
router.delete('/reportes/:id', authMiddleware, deleteReport); // Ruta para eliminar reportes

module.exports = router;
