const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Busca especialistas filtrando por especialidad, ciudad, estado, valoración mínima, disponibilidad y nombre.
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Página actual
 * @param {number} limit - Resultados por página
 * @param {number} minRating - Valoración mínima
 * @param {boolean} available - Disponibilidad (true/false)
 * @param {string} doctorName - Nombre del médico (opcional)
 * @returns {Object} - Resultados y paginación
 */
async function searchDoctors({ specialtyId, cityId, stateId, minRating, available, page = 1, limit = 10, doctorName }) {
  const where = {
    active: true,
    ...(specialtyId && {
      specialties: {
        some: { specialty_id: Number(specialtyId) }
      }
    }),
    location: {
      ...(cityId && { city_id: Number(cityId) }),
      ...(stateId && { state_id: Number(stateId) })
    },
    // Nuevo filtro por disponibilidad
    ...(available === true && {
      availabilities: {
        some: {
          is_available: true
        }
      }
    })
  };

  // Filtro por nombre del médico (doctorName)
  if (doctorName && typeof doctorName === 'string' && doctorName.length >= 3 && doctorName.length <= 255) {
    const words = doctorName.trim().split(/\s+/);
    if (words.length === 1) {
      where.user = {
        first_name: {
          mode: 'insensitive',
          contains: words[0]
        }
      };
    } else {
      where.user = {
        AND: [
          {
            first_name: {
              mode: 'insensitive',
              contains: words[0]
            }
          },
          {
            last_name: {
              mode: 'insensitive',
              contains: words.slice(1).join(' ')
            }
          }
        ]
      };
    }
  }

  // Consulta principal
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
            address: true,
            city: { select: { name: true } },
            state: { select: { name: true } }
          }
        },
        ratings: true,
        availabilities: true
      }
    }),
    prisma.doctor.count({ where })
  ]);

  // Filtrar por valoración mínima si aplica
  const doctors = results
    .map(doc => {
      const avgRating =
        doc.ratings.length > 0
          ? doc.ratings.reduce((acc, r) => acc + r.score, 0) / doc.ratings.length
          : null;
      return {
        id: doc.id,
        name: `${doc.user.first_name} ${doc.user.last_name}`,
        specialty: doc.specialties.map(ds => ds.specialty.name).join(', '),
        city: doc.location?.city?.name || '',
        state: doc.location?.state?.name || '',
        photo: doc.photo_url || '',
        biography: doc.biography || '',
        avgRating,
        available: doc.availabilities.some(a => a.is_available === true)
      };
    })
    .filter(doc => (minRating ? doc.avgRating >= minRating : true));

  return {
    results: doctors,
    pagination: {
      total: doctors.length,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Obtiene el perfil completo de un especialista, excluyendo comentarios (ratings).
 * Los comentarios ahora se consultan únicamente por el endpoint dedicado.
 * @param {number} doctorId
 * @param {string} userRole
 * @returns {Object|null}
 */
async function getDoctorProfile({ doctorId, userRole }) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: Number(doctorId), active: true },
    include: {
      user: { select: { first_name: true, last_name: true, email: true } },
      specialties: {
        include: { specialty: { select: { name: true } } }
      },
      location: {
        select: {
          address: true,
          city: { select: { name: true } },
          state: { select: { name: true } }
        }
      }
    }
  });

  if (!doctor) return null;

  // Calcular valoración promedio (opcional)
  const avgRating = await prisma.rating.aggregate({
    _avg: { score: true },
    where: { doctor_id: doctor.id }
  });

  // Datos públicos
  const profile = {
    id: doctor.id,
    name: `${doctor.user.first_name} ${doctor.user.last_name}`,
    specialty: doctor.specialties.map(ds => ds.specialty.name).join(', '),
    biography: doctor.biography || '',
    photo: doctor.photo_url || '',
    licenseNumber: doctor.license_number,
    title: doctor.specialties[0]?.specialty.name || '',
    city: doctor.location?.city?.name || '',
    state: doctor.location?.state?.name || '',
    avgRating: avgRating._avg.score || null
  };

  // Datos sensibles solo para pacientes autenticados
  if (userRole === 'patient') {
    profile.email = doctor.user.email;
    profile.phone = doctor.phone;
    profile.address = doctor.location?.address || '';

    // Consulta disponibilidad real en la tabla Availability
    const hasAvailability = await prisma.availability.findFirst({
      where: {
        doctor_id: doctor.id,
        is_available: true
      }
    });

    // Campo available: true si el médico está activo y tiene al menos un horario disponible
    profile.available = !!(doctor.active && hasAvailability);
  }

  return profile;
}


module.exports = { searchDoctors, getDoctorProfile };