const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Busca especialistas filtrando por especialidad, ciudad y estado.
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Página actual
 * @param {number} limit - Resultados por página
 * @returns {Object} - Resultados y paginación
 */
async function searchDoctors({ specialtyId, cityId, stateId, page = 1, limit = 10 }) {
  const where = {
    active: true,
    ...(specialtyId && {
      specialties: {
        some: { specialty_id: Number(specialtyId) }
      }
    }),
    ...(cityId && {
      location: { city_id: Number(cityId) }
    }),
    ...(stateId && {
      location: { state_id: Number(stateId) }
    })
  };

  const [results, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { first_name: true, last_name: true } },
        specialties: {
          include: { specialty: { select: { name: true } } }
        },
        location: {
          select: {
            city: { select: { name: true } },
            state: { select: { name: true } }
          }
        }
      }
    }),
    prisma.doctor.count({ where })
  ]);

  const doctors = results.map(doc => ({
    id: doc.id,
    name: `${doc.user.first_name} ${doc.user.last_name}`,
    specialty: doc.specialties.map(ds => ds.specialty.name).join(', '),
    city: doc.location?.city?.name || '',
    state: doc.location?.state?.name || '',
    photo: doc.photo_url || '', // ← Aquí se obtiene la foto del modelo Doctor
    biography: doc.biography || ''
  }));

  return {
    results: doctors,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

module.exports = { searchDoctors };