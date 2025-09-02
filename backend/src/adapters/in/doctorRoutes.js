const express = require('express');
const router = express.Router();
const { searchDoctors } = require('../../domain/doctorService');
const { getDoctorProfile } = require('../../application/getDoctorProfile');
const { getDoctorComments } = require('../../application/getDoctorComments');
const yup = require('yup');

// Esquema de validación Yup para búsqueda
const searchSchema = yup.object().shape({
  specialty_id: yup.number().integer().positive().nullable(true),
  city_id: yup.number().integer().positive().nullable(true),
  state_id: yup.number().integer().positive().nullable(true),
  min_rating: yup.number().min(1).max(5).nullable(true),
  available: yup.boolean().nullable(true),
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
      minRating: validated.min_rating,
      available: validated.available,
      page: validated.page,
      limit: validated.limit
    });

    res.locals.message = 'success';
    res.json(data);
  } catch (err) {
    if (err.name === 'ValidationError') {
      err.statusCode = 400;
      err.errors = err.errors || ['Invalid query parameters'];
      err.message = 'Bad Request';
      return next(err);
    }
    next(err);
  }
});

// Esquema de validación Yup para id de doctor
const doctorIdSchema = yup.object({
  id: yup
    .number()
    .integer()
    .positive()
    .required('Doctor id is required')
});

// Endpoint para consultar perfil de especialista
router.get('/:id', async (req, res, next) => {
  try {
    // Validación de parámetro id
    const validated = await doctorIdSchema.validate(
      {
        id: Number(req.params.id)
      },
      { abortEarly: false }
    );

    // Extraer rol del usuario autenticado
    const userRole = req.user?.role || null;

    // Registrar intento de acceso no autorizado si no es paciente
    if (!req.user || userRole !== 'patient') {
      console.log(req.user);
      console.log(userRole);
      console.log(`[Access] Non-patient or unauthenticated access to sensitive doctor profile fields. User: ${req.user?.id || 'anonymous'}`);
    }

    const profile = await getDoctorProfile(
      validated.id,
      userRole
    );

    if (!profile) {
      return res.status(404).json({
        code: 404,
        message: 'Doctor not found',
        payload: {
          error: ['Doctor with specified ID does not exist']
        }
      });
    }

    res.locals.message = 'success';
    res.json(profile);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        code: 400,
        message: 'Invalid doctor id',
        payload: {
          error: err.errors
        }
      });
    }
    next(err);
  }
});

// Esquema de validación Yup para comentarios
const doctorCommentsSchema = yup.object({
  id: yup
    .number()
    .integer()
    .positive()
    .required('Doctor id is required'),
  page: yup.number().integer().positive().default(1),
  limit: yup.number().integer().positive().max(50).default(5)
});

// Endpoint para consultar comentarios de un especialista
router.get('/:id/comments', async (req, res, next) => {
  try {
    // Validar parámetros
    const validated = await doctorCommentsSchema.validate(
      {
        id: Number(req.params.id),
        page: 1, // paginación fija
        limit: 5 // paginación fija
      },
      { abortEarly: false }
    );

    // Verificar autenticación
    if (!req.user || !req.user.role) {
      console.log(`[Access] Unauthorized access to doctor comments. User: anonymous`);
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized',
        payload: { error: ['Authentication required to view doctor comments'] }
      });
    }

    const comments = await getDoctorComments(validated.id, validated.page, validated.limit);

    res.locals.message = 'success';
    res.json(comments);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        code: 400,
        message: 'Bad Request',
        payload: { error: err.errors }
      });
    }
    next(err);
  }
});

module.exports = router;