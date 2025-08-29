const bcrypt = require('bcryptjs');
const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const jwtService = require('./jwtService');
const { ApiError } = require('../adapters/in/errorHandler');
const prisma = new PrismaClient();

const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required')
});

/**
 * Autenticación de usuario (paciente o médico especialista)
 * @param {Object} data - { email, password }
 * @param {String} userType - 'patient' | 'doctor'
 * @returns {Object} - { token, id, email, userType }
 */
async function loginUser(data, userType) {
  // Validación de datos de entrada
  await loginSchema.validate(data, { abortEarly: false });

  // Buscar usuario por email y tipo
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: userType === 'doctor'
      ? { doctor: true }
      : { patient: true }
  });

  if (!user) {
    throw new ApiError(404, 'User not found', ['User not found']);
  }

  // Verifica el tipo de usuario
  if (user.role !== userType) {
    throw new ApiError(401, 'Invalid credentials', ['Invalid credentials']);
  }

  // Verificar contraseña
  const validPassword = await bcrypt.compare(data.password, user.password_hash);
  if (!validPassword) {
    throw new ApiError(401, 'Invalid credentials', ['Invalid credentials']);
  }

  // Generar JWT
  const token = jwtService.generateToken({
    id: user.id,
    email: user.email,
    userType: user.role
  });

  // Respuesta estándar
  return {
    token,
    id: user.id,
    email: user.email,
    userType: user.role
  };
}

module.exports = { loginUser };