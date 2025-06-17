const { verifyToken } = require('../../config/jwt');
const { prisma } = require('../../config/database');

/**
 * Middleware para verificar la autenticación del usuario
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verificar el token
    const decoded = verifyToken(token);
    
    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Agregar usuario al request
    req.user = user;
    console.log('🔑 Usuario autenticado:', {
      id: user.id,
      email: user.email,
      role: user.role
    });
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {...string|Array} allowedRoles - Roles permitidos
 * @returns {Function} Middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Aplanar el array en caso de que se pase un array como primer argumento
    const flattenedRoles = allowedRoles.flat();
    
    console.log('🔍 Authorize Debug:', {
      userExists: !!req.user,
      userRole: req.user?.role,
      allowedRoles: flattenedRoles,
      hasPermission: req.user ? flattenedRoles.includes(req.user.role) : false
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!flattenedRoles.includes(req.user.role)) {
      console.log('❌ 403 Error - Rol no permitido:', {
        userRole: req.user.role,
        allowedRoles: flattenedRoles
      });
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    console.log('✅ Autorización exitosa');
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
}; 