const express = require('express');
const { createRating, updateRating, getRatingsByReport, getRatingsByUser } = require('../../infrastructure/controllers/ratingController');
const { validateRating, validateRatingUpdate } = require('../validation/ratingValidator');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/ratings', authMiddleware, validateRating, createRating); // Ruta para crear calificaciones
router.put('/ratings/:id', authMiddleware, validateRatingUpdate, updateRating); // Ruta para actualizar calificaciones
router.get('/ratings/report/:reporteId', getRatingsByReport); // Ruta para obtener ratings de un reporte
router.get('/ratings/user', authMiddleware, getRatingsByUser); // Ruta para obtener ratings de los reportes del usuario

module.exports = router; 
