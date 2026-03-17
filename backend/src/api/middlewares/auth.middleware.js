/**
 * Middleware de autenticación con JWT
 */
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Protege rutas que requieren autenticación
 */
exports.protect = async (req, res, next) => {
  let token;

  // Verificar si el token está en los headers de autorización
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extraer token del header Bearer
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Extraer token de cookies, si está disponible
    token = req.cookies.token;
  }

  // Verificar que el token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No estás autorizado para acceder a este recurso'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'El usuario ya no existe en el sistema'
      });
    }

    // Añadir usuario a la request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'No estás autorizado para acceder a este recurso'
    });
  }
};

/**
 * Middleware para autorizar ciertos roles
 * @param {...string} roles - Roles autorizados
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Debes estar autenticado primero'
      });
    }

    // Verificar si el usuario tiene uno de los roles permitidos
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `El rol ${req.user.role} no está autorizado para realizar esta acción`
      });
    }

    next();
  };
}; 