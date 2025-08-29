const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();  

/**
 * Consulta el perfil profesional y ubicación general de un especialista.
 * @param {number} doctorId
 * @returns {object|null} Perfil del especialista o null si no existe/está inactivo
 */
async function getDoctorProfile(doctorId) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      user: true,
      specialties: {
        include: { specialty: true }
      },
      location: {
        include: {
          city: true,
          state: true
        }
      }
    }
  });

  if (!doctor || !doctor.active || !doctor.user.active) {
    return null;
  }

  // Extraer especialidad principal (título)
  const mainSpecialty = doctor.specialties[0]?.specialty;

  return {
    id: doctor.id,
    name: `${doctor.user.first_name} ${doctor.user.last_name}`,
    specialty: mainSpecialty ? mainSpecialty.name : null,
    biography: doctor.biography || '',
    photo: doctor.photo_url || '',
    licenseNumber: doctor.license_number,
    title: mainSpecialty ? mainSpecialty.name : null,
    city: doctor.location.city.name,
    state: doctor.location.state.name,
    email: doctor.user.email || null,
    phone: doctor.phone || null,
    address: doctor.location.address || null
  };
}

module.exports = { getDoctorProfile };