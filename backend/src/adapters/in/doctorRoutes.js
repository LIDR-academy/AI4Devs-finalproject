const express = require('express');
const router = express.Router();
const { searchDoctors } = require('../../domain/doctorService');
const yup = require('yup');

// Esquema de validación Yup
const searchSchema = yup.object().shape({
  specialty_id: yup.number().integer().positive().nullable(true),
  city_id: yup.number().integer().positive().nullable(true),
  state_id: yup.number().integer().positive().nullable(true),
  page: yup.number().integer().positive().default(1),
  limit: yup.number().integer().positive().max(100).default(10)
});

// Endpoint de búsqueda de especialistas
router.get('/search', async (req, res, next) => {
  try {
    // Validar parámetros de consulta
    const validated = await searchSchema.validate(req.query, { abortEarly: false, stripUnknown: true });

    const data = await searchDoctors({
      specialtyId: validated.specialty_id,
      cityId: validated.city_id,
      stateId: validated.state_id,
      page: validated.page,
      limit: validated.limit
    });

    res.json(data);
  } catch (err) {
    // Si es error de validación Yup, estructurarlo
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: {
          type: 'ValidationError',
          message: 'Parámetros de consulta inválidos',
          details: err.errors
        }
      });
    }
    next(err);
  }
});

module.exports = router;