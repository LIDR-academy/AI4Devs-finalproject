const { verifyToken } = require('../../domain/jwtService');

/**
 * Middleware global para autenticación JWT.
 * Si el token es válido, agrega el usuario y rol a req.user.
 * Si no hay token o es inválido, continúa como visitante y registra un log.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyToken(token);
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role
      };
    } catch (err) {
      console.log(`[Auth] Invalid token: ${err.message}`);
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

module.exports = authMiddleware;