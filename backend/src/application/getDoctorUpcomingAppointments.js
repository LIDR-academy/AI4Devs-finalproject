const yup = require('yup');
const { getAppointments } = require('../domain/doctorAppointmentService');
const { ApiError } = require('../adapters/in/errorHandler');

// Esquema de validación para filtros de consulta
const filterSchema = yup.object().shape({
  date: yup.date().optional(),
  status: yup.string().oneOf(['pending', 'confirmed']).optional(),
  page: yup.number().integer().positive().default(1),
  limit: yup.number().integer().positive().max(50).default(10)
});

/**
 * Caso de uso: Obtener próximas citas del médico especialista autenticado.
 * @param {Object} params - { doctorId, date, status, page, limit }
 * @returns {Object} Listado paginado de próximas citas
 */
async function getDoctorUpcomingAppointments({ doctorId, date, status, page = 1, limit = 10 }) {
  try {
    await filterSchema.validate({ date, status, page, limit }, { abortEarly: false });

    // Llama al servicio de dominio con upcoming=true
    const result = await getAppointments({
      doctorId,
      date,
      status,
      upcoming: true,
      page,
      limit
    });

    return result;
  } catch (err) {
    // Lanza error customizado para el middleware global
    if (err.name === 'ValidationError') {
      throw new ApiError(400, 'Validation error', err.errors);
    }
    throw err;
  }
}

module.exports = { getDoctorUpcomingAppointments };