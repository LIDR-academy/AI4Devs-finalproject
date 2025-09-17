const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../adapters/in/errorHandler');

// Validación de disponibilidad: un rango por día
const availabilitySchema = yup.object().shape({
  daysOfWeek: yup.array().of(
    yup.number().min(0).max(6).required() // 0: Sunday, 6: Saturday
  ).required(),
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
 * Si ya existe disponibilidad para el día, la sobrescribe.
 * Por ahora solo permite un rango por día.
 * // TODO: Permitir múltiples rangos por día en tickets futuros.
 * @param {Object} params - { doctorId, daysOfWeek, ranges }
 * @returns {Array} Disponibilidad actualizada del médico
 */
async function setAvailability({ doctorId, daysOfWeek, ranges }) {
  await availabilitySchema.validate({ daysOfWeek, ranges }, { abortEarly: false });

  // Validar que no haya rangos solapados para el mismo día
  const seenDays = new Set();
  for (const range of ranges) {
    if (seenDays.has(range.dayOfWeek)) {
      throw new ApiError(400, 'Overlapping ranges for the same day are not allowed', [
        `Multiple ranges for day ${range.dayOfWeek} are not allowed`
      ]);
    }
    seenDays.add(range.dayOfWeek);
    // TODO: Validar solapamiento si se permite múltiples rangos por día
  }

  // Para cada rango, sobrescribe la disponibilidad para ese día
  for (const range of ranges) {
    await prisma.availability.deleteMany({
      where: {
        doctor_id: doctorId,
        day_of_week: range.dayOfWeek
      }
    });

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

  // Retorna toda la disponibilidad actual del médico
  const availabilities = await prisma.availability.findMany({
    where: { doctor_id: doctorId },
    orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
  });

  return availabilities.map(a => ({
    dayOfWeek: a.day_of_week,
    startTime: a.start_time.toISOString().substring(11, 16), // HH:mm
    endTime: a.end_time.toISOString().substring(11, 16),     // HH:mm
    available: a.is_available
  }));
}

/**
 * Consulta la disponibilidad actual del médico.
 * @param {Number} doctorId
 * @returns {Array} Disponibilidad por día y rango
 */
async function getAvailability(doctorId) {
  const availabilities = await prisma.availability.findMany({
    where: { doctor_id: doctorId },
    orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
  });

  // Formatea la respuesta
  return availabilities.map(a => ({
    dayOfWeek: a.day_of_week,
    startTime: a.start_time.toISOString().substring(11, 16), // HH:mm
    endTime: a.end_time.toISOString().substring(11, 16),     // HH:mm
    available: a.is_available
  }));
}

module.exports = { setAvailability, getAvailability };