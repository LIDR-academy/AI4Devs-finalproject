const express = require('express');
const router = express.Router();
const { searchDoctors } = require('../../domain/doctorService');
const { getDoctorProfile } = require('../../application/getDoctorProfile');
const { getDoctorComments } = require('../../application/getDoctorComments');
const { getDoctorUpcomingAppointments } = require('../../application/getDoctorUpcomingAppointments');
const { setAvailability, getAvailability } = require('../../domain/doctorAvailabilityService');
const { getAppointments, updateAppointmentStatus } = require('../../domain/doctorAppointmentService');
const { requireDoctorRole } = require('./authMiddleware');
const logger = require('../../config/logger');


const { ApiError } = require('./errorHandler');
const yup = require('yup');

// Esquema de validación Yup para búsqueda
const searchSchema = yup.object().shape({
  specialty_id: yup.number().integer().positive().nullable(true),
  city_id: yup.number().integer().positive().nullable(true),
  state_id: yup.number().integer().positive().nullable(true),
  min_rating: yup.number().min(1).max(5).nullable(true),
  available: yup.boolean().nullable(true),
  doctor_name: yup.string().min(3).max(255).nullable(true),
  page: yup.number().integer().positive().default(1),
  limit: yup.number().integer().positive().max(100).default(10)
});

// Endpoint de búsqueda de especialistas
router.get('/search', async (req, res, next) => {
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

  try {
    // Validar parámetros de consulta
    const validated = await searchSchema.validate(req.query, { abortEarly: false, stripUnknown: true });

    const data = await searchDoctors({
      specialtyId: validated.specialty_id,
      cityId: validated.city_id,
      stateId: validated.state_id,
      minRating: validated.min_rating,
      available: validated.available,
      doctorName: validated.doctor_name, // <-- Nuevo parámetro
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


// GET /api/doctor/availability
router.get('/availability', requireDoctorRole, async (req, res, next) => {
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

  try {
    const doctorId = req.user.id;
    const result = await getAvailability(doctorId);
    res.locals.message = 'success';
    res.json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST /api/doctor/availability
router.post('/availability', requireDoctorRole, async (req, res, next) => {
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

  try {
    const doctorId = req.user.id;
    const { daysOfWeek, ranges } = req.body;
    const result = await setAvailability({ doctorId, daysOfWeek, ranges });
    res.locals.message = 'Availability updated';
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Esquema de validación Yup para consulta de citas (incluye paginación)
const appointmentsQuerySchema = yup.object().shape({
  date: yup.date().optional(),
  status: yup.string().oneOf(['pending', 'confirmed', 'rejected']).optional(),
  page: yup.number().integer().positive().default(1),
  limit: yup.number().integer().positive().max(50).default(10)
});

// GET /api/doctor/appointments
router.get('/appointments', requireDoctorRole, async (req, res, next) => {
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

  try {
    // Validar parámetros de consulta
    const validated = await appointmentsQuerySchema.validate(
      {
        date: req.query.date,
        status: req.query.status,
        upcoming: false,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10
      },
      { abortEarly: false }
    );

    const doctorId = req.user.id;

    // Llama al servicio de dominio con los parámetros validados
    const result = await getAppointments({
      doctorId,
      date: validated.date,
      status: validated.status,
      upcoming: validated.upcoming,
      page: validated.page,
      limit: validated.limit
    });

    res.locals.message = 'success';
    res.json(result);
  } catch (error) {
    if (error.name === 'ValidationError') {
      error.statusCode = 400;
      error.errors = error.errors || ['Invalid query parameters'];
      error.message = 'Bad Request';
      return next(error);
    }
    next(error);
  }
});

// PATCH /api/doctor/appointments/:id
router.patch('/appointments/:id', requireDoctorRole, async (req, res, next) => {
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

  try {
    const doctorId = req.user.id;
    const appointmentId = Number(req.params.id);
    const { status } = req.body;
    const result = await updateAppointmentStatus({ appointmentId, doctorId, status });
    res.locals.message = 'Appointment status updated';
    res.json(result);
    // TODO: Implement notification to patient in future tickets
  } catch (error) {
    next(error);
  }
});

// GET /api/doctors/upcoming-appointments
router.get('/upcoming-appointments', requireDoctorRole, async (req, res, next) => {
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

  try {
    const doctorId = req.user.id;
    const { date, status, page = 1, limit = 10 } = req.query;

    // Orquestar el caso de uso
    const result = await getDoctorUpcomingAppointments({
      doctorId,
      date,
      status,
      page: Number(page),
      limit: Number(limit)
    });

    res.locals.message = 'success';
    res.json(result);
  } catch (error) {
    next(error);
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
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

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
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

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