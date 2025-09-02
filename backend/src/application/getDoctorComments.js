const { getDoctorComments: getDoctorCommentsDomain } = require('../domain/doctorCommentsService');

/**
 * Orquesta la consulta de comentarios paginados de un doctor.
 * @param {number} doctorId - ID del doctor
 * @param {number} page - Página (fija, default 1)
 * @param {number} limit - Cantidad por página (fija, default 5)
 * @returns {object} - Comentarios y paginación
 */
async function getDoctorComments(doctorId, page = 1, limit = 5) {
  return await getDoctorCommentsDomain({
    doctorId,
    page,
    limit
  });
}

module.exports = { getDoctorComments };