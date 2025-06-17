/**
 * Middleware para el manejo centralizado de errores
 */

// Manejador de errores personalizado
const errorHandler = (err, req, res, next) => {
  // Log para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Preparar mensaje de error y estatus
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'Error del servidor';
  const stack = process.env.NODE_ENV === 'production' ? '🥞' : err.stack;

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: stack,
    timestamp: new Date().toISOString()
  });
};

module.exports = { errorHandler }; 