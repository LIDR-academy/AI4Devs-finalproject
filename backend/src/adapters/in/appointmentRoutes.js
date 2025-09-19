const express = require('express');
const yup = require('yup');
const { ApiError } = require('./errorHandler');
const appointmentService = require('../../domain/appointmentService');
const logger = require('../../config/logger');

const router = express.Router();

// Esquema de validación Yup para agendar cita
const appointmentSchema = yup.object().shape({
  doctor_id: yup.number()
    .typeError('doctor_id must be a number')
    .required('doctor_id is required'),
  appointment_date: yup.date()
    .typeError('appointment_date must be a valid ISO date')
    .required('appointment_date is required')
    .test(
      'is-hour',
      'Appointments must be scheduled at the start of the hour (e.g., 10:00, 11:00)',
      value => {
        if (!value) return false;
        const date = new Date(value);
        return date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
      }
    )
    .test(
      'not-in-past',
      'Appointment date cannot be in the past',
      value => {
        if (!value) return false;
        return new Date(value) >= new Date();
      }
    )
    .test(
      'not-too-far',
      'Appointment date cannot be more than 3 months in the future',
      value => {
        if (!value) return false;
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        return new Date(value) <= threeMonthsLater;
      }
    ),
  reason: yup.string().max(255, 'reason must be at most 255 characters').nullable(true)
});

// Middleware para verificar rol de paciente
function requirePatientRole(req, res, next) {
  if (!req.user || req.user.role !== 'patient') {
    return next(new ApiError(403, 'Forbidden', ['Only patients can schedule appointments']));
  }
  next();
}

// POST /api/appointments
router.post('/', requirePatientRole, async (req, res, next) => {
  logger.info(`[Access] ${req.method} ${req.originalUrl} | User: ${req.user?.id || 'anonymous'} | IP: ${req.ip}`);

  try {
    // Validar datos de entrada
    await appointmentSchema.validate(req.body, { abortEarly: false });

    const { doctor_id, appointment_date, reason } = req.body;
    const patientId = req.user.id;

    // Orquestar caso de uso en el servicio de dominio
    const appointment = await appointmentService.createAppointment({
      doctorId: doctor_id,
      patientId,
      appointmentDate: appointment_date,
      reason
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
});

module.exports = router;