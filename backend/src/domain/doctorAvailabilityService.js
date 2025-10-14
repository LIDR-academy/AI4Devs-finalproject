const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../adapters/in/errorHandler');

// Validación de disponibilidad: un rango por día
const availabilitySchema = yup.object().shape({
  ranges: yup.array().of(
    yup.object().shape({
      dayOfWeek: yup.number().min(0).max(6).required(),
      startTime: yup.string().required(), // formato HH:mm
      endTime: yup.string().required(),   // formato HH:mm
      blocked: yup.boolean().default(false),
    })
  ).required(),
});

/**
 * Define o modifica la disponibilidad del médico por día de la semana.
 * Solo toma en cuenta los valores de entrada "ranges" y realiza una comparación
 * con los registros existentes para determinar qué horarios eliminar.
 * @param {Object} params - { doctorId, ranges }
 * @returns {Array} Disponibilidad actualizada del médico
 */
async function setAvailability({ doctorId, ranges }) {
  await availabilitySchema.validate({ ranges }, { abortEarly: false });

  // Validar que no haya rangos solapados para el mismo día
  const seenDays = new Set();
  for (const range of ranges) {
    if (seenDays.has(range.dayOfWeek)) {
      throw new ApiError(400, 'Overlapping ranges for the same day are not allowed', [
        `Multiple ranges for day ${range.dayOfWeek} are not allowed`
      ]);
    }
    seenDays.add(range.dayOfWeek);
  }

  // 1. Leer todos los horarios actuales del médico
  const currentAvailabilities = await prisma.availability.findMany({
    where: { doctor_id: doctorId },
  });

  // 2. Obtener los días de la semana presentes en los rangos recibidos
  const rangesDaysOfWeek = ranges.map(range => range.dayOfWeek);

  // 3. Determinar los días que se deben eliminar (están en BD pero no en la petición)
  const daysToDelete = currentAvailabilities
    .map(avail => avail.day_of_week)
    .filter(day => !rangesDaysOfWeek.includes(day));

  // 4. Eliminar los días que ya no están en la nueva disponibilidad
  if (daysToDelete.length > 0) {
    await prisma.availability.deleteMany({
      where: {
        doctor_id: doctorId,
        day_of_week: { in: daysToDelete }
      }
    });
  }

  // 5. Procesar los rangos nuevos o actualizados
  for (const range of ranges) {
    // Buscar si ya existe una disponibilidad para este día
    const existingAvailability = currentAvailabilities.find(
      a => a.day_of_week === range.dayOfWeek
    );

    if (existingAvailability) {
      // Actualizar la disponibilidad existente
      await prisma.availability.update({
        where: { id: existingAvailability.id },
        data: {
          start_time: new Date(`1970-01-01T${range.startTime}:00Z`),
          end_time: new Date(`1970-01-01T${range.endTime}:00Z`),
          is_available: !range.blocked,
        }
      });
    } else {
      // Crear nueva disponibilidad
      await prisma.availability.create({
        data: {
          doctor_id: doctorId,
          day_of_week: range.dayOfWeek,
          start_time: new Date(`1970-01-01T${range.startTime}:00Z`),
          end_time: new Date(`1970-01-01T${range.endTime}:00Z`),
          is_available: !range.blocked,
        }
      });
    }
  }

  // 6. Retorna toda la disponibilidad actualizada del médico
  const updatedAvailabilities = await prisma.availability.findMany({
    where: { doctor_id: doctorId },
    orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
  });

  return updatedAvailabilities.map(a => ({
    dayOfWeek: a.day_of_week,
    startTime: a.start_time.toISOString().substring(11, 16), // HH:mm
    endTime: a.end_time.toISOString().substring(11, 16),     // HH:mm
    available: a.is_available
  }));
}



/**
 * Consulta la disponibilidad actual del médico y los horarios ocupados futuros.
 * @param {Number} doctorId
 * @param {String} role - 'doctor' | 'patient'
 * @returns {Object|null} { availability: [...], occupiedSlots: [...] } o null si no existe el médico o está inactivo
 */
async function getAvailability(doctorId, role) {
  // Validar que el médico existe y está activo
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { user: true }
  });
  if (!doctor || !doctor.active || !doctor.user.active) {
    return null; // 404 en el adaptador
  }

  // Consulta la disponibilidad
  const availabilities = await prisma.availability.findMany({
    where: { doctor_id: doctorId },
    orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
  });

  // Filtrar por rol
  let availability = availabilities.map(a => ({
    dayOfWeek: a.day_of_week,
    startTime: a.start_time.toISOString().substring(11, 16), // HH:mm
    endTime: a.end_time.toISOString().substring(11, 16),     // HH:mm
    available: a.is_available
  }));

  if (role === 'patient') {
    availability = availability.filter(a => a.available === true);
  }

  // Consulta los horarios ocupados futuros (pending/confirmed)
  const now = new Date();
  const appointments = await prisma.appointment.findMany({
    where: {
      doctor_id: doctorId,
      appointment_date: { gte: now },
      status: { in: ['pending', 'confirmed'] }
    },
    orderBy: { appointment_date: 'asc' }
  });

  const occupiedSlots = appointments.map(a => ({
    id: a.id,
    appointmentDate: a.appointment_date.toISOString()
  }));

  return { availability, occupiedSlots };
}


module.exports = { setAvailability, getAvailability };