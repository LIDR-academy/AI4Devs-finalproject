const jwt = require('jsonwebtoken');

/**
 * Genera un JWT con el payload especificado.
 * @param {Object} payload - Datos a incluir en el token.
 * @returns {string} JWT generado.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Verifica y decodifica un JWT.
 * @param {string} token - Token JWT a verificar.
 * @returns {Object} Payload decodificado si es válido.
 * @throws {Error} Si el token es inválido o expirado.
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };