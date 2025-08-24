/**
 * Middleware global para manejo de errores.
 * Formatea todos los errores siguiendo el estándar definido.
 */
function errorHandler(err, req, res, next) {
  // Determina el código de error
  const statusCode = err.statusCode || 500;
  // Mensaje estándar en inglés
  let message = 'Internal Server Error';

  // Mensajes personalizados según código
  if (statusCode === 400) message = 'Bad Request';
  else if (statusCode === 401) message = 'Unauthorized';
  else if (statusCode === 403) message = 'Forbidden';
  else if (statusCode === 404) message = 'Not Found';
  else if (statusCode === 503) message = 'Service Unavailable';

  // Permite personalizar el mensaje desde el error lanzado
  if (err.message) message = err.message;

  // Estructura estándar de error
  res.status(statusCode).json({
    code: statusCode,
    message,
    payload: {
      error: Array.isArray(err.errors)
        ? err.errors
        : [err.errors || err.message || 'Unexpected error']
    }
  });
}

module.exports = errorHandler;