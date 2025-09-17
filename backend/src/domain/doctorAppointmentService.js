const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../adapters/in/errorHandler');

// Validación para actualizar estado de cita
const statusSchema = yup.object().shape({
  status: yup.string().oneOf(['confirmed', 'rejected'], 'Invalid status').required('Status is required')
});

/**
 * Consulta citas agendadas del médico, filtrando por fecha y estado.
 * @param {Object} params - { doctorId, date, status }
 * @returns {Array} Listado de citas con información relevante del paciente y estado
 */
async function getAppointments({ doctorId, date, status }) {
  const where = { doctor_id: doctorId };
  if (date) {
    // Filtra por fecha exacta (solo día, sin hora)
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.appointment_date = { gte: start, lte: end };
  }
  if (status) {
    where.status = status;
  }

  const appointments = await prisma.appointment.findMany({
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
    orderBy: { appointment_date: 'asc' }
  });

  return appointments.map(a => ({
    id: a.id,
    appointmentDate: a.appointment_date,
    status: a.status,
    reason: a.reason,
    patient: {
      id: a.patient.user.id,
      firstName: a.patient.user.first_name,
      lastName: a.patient.user.last_name,
      email: a.patient.user.email
    }
  }));
}

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

module.exports = { getAppointments, updateAppointmentStatus };