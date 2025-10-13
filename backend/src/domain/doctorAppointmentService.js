const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../adapters/in/errorHandler');

// Esquema de validación para consulta de citas
const appointmentsQuerySchema = yup.object().shape({
  date: yup.date().optional(),
  status: yup.string().oneOf(['pending', 'confirmed', 'rejected']).optional(),
  upcoming: yup.boolean().optional(),
  page: yup.number().integer().positive().default(1),
  limit: yup.number().integer().positive().max(50).default(10)
});

/**
 * Consulta citas del médico, con opción de filtrar solo próximas citas y paginación.
 * @param {Object} params - { doctorId, date, status, upcoming, page, limit }
 * @returns {Object} Listado paginado de citas con información relevante del paciente y cita
 */
async function getAppointments({ doctorId, date, status, upcoming = false, page = 1, limit = 10 }) {
  await appointmentsQuerySchema.validate({ date, status, upcoming, page, limit }, { abortEarly: false });

  const where = { doctor_id: doctorId };

  // Filtrar por próximas citas si upcoming=true
  if (upcoming) {
    const now = new Date();
    where.appointment_date = { gte: now };
    where.status = { in: ['pending', 'confirmed'] };
  }

  // Filtrar por fecha exacta si se envía
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.appointment_date = { gte: start, lte: end };
  }

  // Filtrar por estado si se envía y no está en modo upcoming
  if (status && !upcoming) {
    where.status = status;
  }

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { appointment_date: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })
  ]);

  return {
    results: appointments.map(a => ({
      id: a.id,
      appointmentDate: a.appointment_date,
      status: a.status,
      reason: a.reason,
      patient: {
        id: a.patient.user.id,
        firstName: a.patient.user.first_name,
        lastName: a.patient.user.last_name,
        email: a.patient.user.email,
        phone: a.patient.phone,
        gender: a.patient.user.gender
      }
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Validación para actualizar estado de cita
const statusSchema = yup.object().shape({
  status: yup.string().oneOf(['confirmed', 'rejected'], 'Invalid status').required('Status is required')
});

/**
 * Actualiza el estado de una cita (confirmar o rechazar).
 * Si se rechaza, actualiza la disponibilidad.
 * // TODO: Notificar al paciente sobre el cambio de estado en tickets futuros.
 * @param {Object} params - { appointmentId, doctorId, status }
 * @returns {Object} Cita actualizada
 */
async function updateAppointmentStatus({ appointmentId, doctorId, status }) {
  await statusSchema.validate({ status }, { abortEarly: false });

  // Busca la cita
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true }
  });

  if (!appointment || appointment.doctor_id !== doctorId) {
    throw new ApiError(404, 'Appointment not found', [
      'Appointment does not exist or does not belong to this doctor'
    ]);
  }

  if (appointment.status === status) {
    throw new ApiError(400, 'Appointment already has this status', [
      `Appointment is already ${status}`
    ]);
  }

  // Actualiza el estado
  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status }
  });

  // Si se rechaza, actualizar disponibilidad (opcional según lógica de negocio)
  if (status === 'rejected') {
    // TODO: Liberar el horario en la disponibilidad si aplica
    // // TODO: Implementar notificación al paciente en tickets futuros
  }

  return {
    id: updated.id,
    appointmentDate: updated.appointment_date,
    status: updated.status,
    reason: updated.reason
  };
}


/**
 * Consulta las citas futuras ocupadas (pending/confirmed) de un médico.
 * @param {Number} doctorId
 * @returns {Array} Lista de objetos { id, appointmentDate }
 */
async function getOccupiedSlots(doctorId) {
  const now = new Date();
  const appointments = await prisma.appointment.findMany({
    where: {
      doctor_id: doctorId,
      appointment_date: { gte: now },
      status: { in: ['pending', 'confirmed'] }
    },
    orderBy: { appointment_date: 'asc' }
  });

  return appointments.map(a => ({
    id: a.id,
    appointmentDate: a.appointment_date.toISOString()
  }));
}

module.exports = { getAppointments, updateAppointmentStatus, getOccupiedSlots };