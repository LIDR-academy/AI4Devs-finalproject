const { getDoctorProfile: getDoctorProfileDomain } = require('../domain/doctorService');

/**
 * Orquesta la consulta del perfil profesional y controla la visibilidad de datos sensibles.
 * @param {number} doctorId
 * @param {string} userRole
 * @returns {object|null} Perfil del especialista o null si no existe/está inactivo
 */
async function getDoctorProfile(doctorId, userRole = null) {
  // Pasa el userRole al servicio de dominio para controlar los datos sensibles y el campo "available"
  return await getDoctorProfileDomain({
    doctorId,
    userRole
  });
}

module.exports = { getDoctorProfile };