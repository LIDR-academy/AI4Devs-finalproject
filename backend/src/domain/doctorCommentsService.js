const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Consulta comentarios paginados de un doctor.
 * Solo usuarios autenticados pueden acceder.
 * @param {number} doctorId - ID del doctor
 * @param {number} page - Página (fija, default 1)
 * @param {number} limit - Cantidad por página (fija, default 5)
 * @returns {Object} - Comentarios y paginación
 */
async function getDoctorComments({ doctorId, page = 1, limit = 5 }) {
  // Consulta paginada de comentarios
  const [comments, total] = await Promise.all([
    prisma.rating.findMany({
      where: { doctor_id: Number(doctorId) },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { rating_date: 'desc' },
      include: {
        patient: {
          include: {
            user: { select: { first_name: true, last_name: true } }
          }
        }
      }
    }),
    prisma.rating.count({ where: { doctor_id: Number(doctorId) } })
  ]);

  // Formatea los comentarios según anonimato
  const formatted = comments.map(c => ({
    doctor_id: c.doctor_id,
    score: c.score,
    comment: c.comment,
    created_at: c.rating_date,
    anonymous: c.anonymous,
    patient_name: c.anonymous
      ? 'Anonymous'
      : `${c.patient?.user?.first_name || ''} ${c.patient?.user?.last_name || ''}`.trim()
  }));

  return {
    results: formatted,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

module.exports = { getDoctorComments };