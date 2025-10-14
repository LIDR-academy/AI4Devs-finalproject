const express = require('express');
const router = express.Router();
const { searchDoctors } = require('../../domain/doctorService');
const { getDoctorProfile } = require('../../application/getDoctorProfile');
const { getDoctorComments } = require('../../application/getDoctorComments');
const { getDoctorUpcomingAppointments } = require('../../application/getDoctorUpcomingAppointments');
const { setAvailability, getAvailability } = require('../../domain/doctorAvailabilityService');
const { getAppointments, updateAppointmentStatus } = require('../../domain/doctorAppointmentService');
const { requireDoctorRole } = require('./authMiddleware');
const yup = require('yup');
const { ApiError } = require('./errorHandler');
const logger = require('../../config/logger');



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


/*// GET /api/doctor/availability
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
});*/

// Validación Yup para doctorId en la ruta
const doctorIdAvailableSchema = yup.object().shape({
  doctorId: yup
    .number()
    .integer()
    .min(1, 'Doctor ID must be a positive integer')
    .required('Doctor ID is required for patients')
});

// Ruta: GET /api/doctors/availability/:doctorId?
router.get('/availability/:doctorId?', async (req, res, next) => {
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);
  try {
    const { user } = req;
    const doctorIdParam = req.params.doctorId;

    // Validación para pacientes: doctorId es obligatorio
    if (user.role === 'patient') {
      await doctorIdAvailableSchema.validate({ doctorId: doctorIdParam }, { abortEarly: false });
    }

    // Para médicos: si no envía doctorId, consulta su propio horario
    const doctorId = doctorIdParam
      ? parseInt(doctorIdParam, 10)
      : user.role === 'doctor'
        ? user.id
        : null;

    // Validación extra: si no hay doctorId, error 400
    if (!doctorId) {
      throw new ApiError(400, 'Doctor ID is required for patients', ['Doctor ID is required for patients']);
    }

    // Llama al servicio de dominio
    const result = await getAvailability(doctorId, user.role);

    // Manejo de error 404 si el médico no existe o está inactivo
    if (result === null) {
      throw new ApiError(404, 'Doctor not found', ['Doctor with specified ID does not exist or is inactive']);
    }
    // Manejo de error 404 si no hay horarios definidos
    if (Array.isArray(result.availability) && result.availability.length === 0) {
      throw new ApiError(404, 'No availability defined', ['No availability defined for this doctor']);
    }

    // Respuesta estándar: incluye disponibilidad y horarios ocupados
    res.json({
      availability: result.availability,
      occupiedSlots: result.occupiedSlots
    });
  } catch (err) {
    next(err);
  }
});

// Esquema de validación Yup para disponibilidad médica (seguridad y formato)
const availabilitySchema = yup.object().shape({
  ranges: yup.array()
    .of(
      yup.object().shape({
        dayOfWeek: yup.number()
          .integer('Day of week must be an integer')
          .min(0, 'Day of week must be between 0 and 6')
          .max(6, 'Day of week must be between 0 and 6')
          .required('dayOfWeek is required'),
        startTime: yup.string()
          .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'startTime must be in HH:mm format')
          .required('startTime is required'),
        endTime: yup.string()
          .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'endTime must be in HH:mm format')
          .required('endTime is required'),
        blocked: yup.boolean().default(false)
      })
    )
    .required('ranges is required')
    .min(1, 'At least one range must be provided')
    .test('uniqueDay', 'ranges must not contain duplicate dayOfWeek values', arr => Array.isArray(arr) && new Set(arr.map(r => r.dayOfWeek)).size === arr.length)
    .test('validRange', 'startTime must be before endTime', arr => Array.isArray(arr) && arr.every(r => r.startTime < r.endTime))
});

// POST /api/doctor/availability
router.post('/availability', requireDoctorRole, async (req, res, next) => {
  logger.info(`[Access] ${req.method} ${req.originalUrl} | Body: ${JSON.stringify(req.body)} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

  try {
    // Validación de seguridad y formato de entrada (solo "ranges")
    await availabilitySchema.validate(req.body, { abortEarly: false });

    const doctorId = req.user.id;
    const { ranges } = req.body;
    const result = await setAvailability({ doctorId, ranges });

    res.locals.message = 'Availability updated';
    res.status(201).json(result);
  } catch (error) {
    //console.error(error);
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

// Validación Yup para doctorId en la ruta, profiel
const doctorIdProfileSchema = yup.object().shape({
  id: yup
    .number()
    .integer()
    .min(1, 'Doctor ID must be a positive integer')
    .required('Doctor ID is required for patients')
});

// Endpoint para consultar perfil de especialista
router.get('/:id', async (req, res, next) => {
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

  try {
    // Validación de parámetro id
    const validated = await doctorIdProfileSchema.validate(
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
    console.error(err);
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