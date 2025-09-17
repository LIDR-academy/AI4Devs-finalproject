const { PrismaClient } = require('@prisma/client');
const { ApiError } = require('../adapters/in/errorHandler');
const prisma = new PrismaClient();

/**
 * Lógica principal para agendar una cita.
 * @param {Object} params - { doctorId, patientId, appointmentDate, reason }
 * @returns {Object} - Datos de la cita agendada
 */
async function createAppointment({ doctorId, patientId, appointmentDate, reason }) {
  // Validaciones críticas en el dominio (defensa en profundidad)
  const dateObj = new Date(appointmentDate);

  // Validar que la fecha no sea en el pasado
  const now = new Date();
  if (dateObj < now) {
    throw new ApiError(400, 'Invalid appointment date', ['Appointment date cannot be in the past']);
  }

  // Validar que la fecha no sea mayor a 3 meses en el futuro
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  if (dateObj > threeMonthsLater) {
    throw new ApiError(400, 'Invalid appointment date', ['Appointment date cannot be more than 3 months in the future']);
  }

  // Validar que la cita sea al inicio de la hora (minutos y segundos = 0)
  if (dateObj.getMinutes() !== 0 || dateObj.getSeconds() !== 0 || dateObj.getMilliseconds() !== 0) {
    throw new ApiError(400, 'Invalid appointment time', ['Appointments must be scheduled at the start of the hour (e.g., 10:00, 11:00)']);
  }

  // 1. Verificar que el doctor exista y esté activo
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { user: true }
  });
  if (!doctor || !doctor.active || !doctor.user.active) {
    throw new ApiError(404, 'Doctor not found', ['Doctor not found or inactive']);
  }

  // 2. Verificar que el paciente exista y esté activo
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: true }
  });
  if (!patient || !patient.user.active) {
    throw new ApiError(404, 'Patient not found', ['Patient not found or inactive']);
  }

  // Validar que la cita esté dentro del horario disponible del médico
  // 1. Obtener el día de la semana de la cita (0 = domingo, 6 = sábado)
  const appointmentDay = dateObj.getDay();
  const appointmentHour = dateObj.getHours();

  // 2. Consultar bloques de disponibilidad del médico para ese día
  const availabilities = await prisma.availability.findMany({
    where: {
      doctor_id: doctorId,
      day_of_week: appointmentDay,
      is_available: true
    }
  });

  // 3. Verificar si la hora de la cita está dentro de algún bloque disponible
  const isWithinAvailability = availabilities.some(avail => {
    const start = new Date(avail.start_time);
    const end = new Date(avail.end_time);
    // Solo comparar la hora (ignorar fecha)
    return (
      appointmentHour >= start.getHours() &&
      appointmentHour < end.getHours()
    );
  });

  if (!isWithinAvailability) {
    throw new ApiError(
      400,
      "Appointment time is outside doctor's available hours",
      ["Appointment time is outside doctor's available hours"]
    );
  }

  // 4. Validar disponibilidad y conflictos de horario
  // Solo considerar citas en estado "pending" y "confirmed"
  const conflictingDoctorAppointment = await prisma.appointment.findFirst({
    where: {
      doctor_id: doctorId,
      appointment_date: appointmentDate,
      status: { in: ['pending', 'confirmed'] }
    }
  });
  if (conflictingDoctorAppointment) {
    throw new ApiError(409, 'Time slot not available', ['Doctor already has an appointment at this time']);
  }

  const conflictingPatientAppointment = await prisma.appointment.findFirst({
    where: {
      patient_id: patientId,
      appointment_date: appointmentDate,
      status: { in: ['pending', 'confirmed'] }
    }
  });
  if (conflictingPatientAppointment) {
    throw new ApiError(409, 'Time slot not available', ['Patient already has an appointment at this time']);
  }

  // 4. Registrar la cita en la entidad APPOINTMENT con estado "pending"
  const appointment = await prisma.appointment.create({
    data: {
      doctor_id: doctorId,
      patient_id: patientId,
      appointment_date: appointmentDate,
      status: 'pending',
      reason: reason || null
    }
  });

  // 5. Comentario para futuras notificaciones
  // TODO: Implement email/SMS notification to doctor and patient when appointment is created

  // 6. Retornar confirmación de la cita agendada
  return {
    id: appointment.id,
    doctor_id: appointment.doctor_id,
    patient_id: appointment.patient_id,
    appointment_date: appointment.appointment_date,
    status: appointment.status,
    reason: appointment.reason
  };
}

module.exports = { createAppointment };