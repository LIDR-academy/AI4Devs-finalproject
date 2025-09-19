const logger = require('../../config/logger');
/**
 * Clase customizada para errores API.
 */
class ApiError extends Error {
  constructor(code, message, errors = []) {
    super(message);
    this.code = code;
    this.errors = errors;
  }
}

/**
 * Middleware global para manejo de errores.
 * Formatea todos los errores siguiendo el estándar definido.
 */
function errorHandler(err, req, res, next) {
  // Si es una instancia de ApiError, responde con el formato estándar
  if (err instanceof ApiError) {
    return res.status(err.code).json({
      code: err.code,
      message: err.message,
      payload: {
        error: Array.isArray(err.errors)
          ? err.errors
          : [err.errors || err.message || 'Unexpected error']
      }
    });
  }

  // Si es un error de validación de Yup
  if (err.name === 'ValidationError' && err.errors) {
    return res.status(400).json({
      code: 400,
      message: 'Validation error',
      payload: { error: err.errors }
    });
  }

  // Determina el código de error
  const statusCode = err.statusCode || 500;
  let message = 'Internal Server Error';

  // Mensajes personalizados según código
  if (statusCode === 400) message = 'Bad Request';
  else if (statusCode === 401) message = 'Unauthorized';
  else if (statusCode === 403) message = 'Forbidden';
  else if (statusCode === 404) message = 'Not Found';
  else if (statusCode === 503) message = 'Service Unavailable';

  // Permite personalizar el mensaje desde el error lanzado
  if (err.message) message = err.message;

  // Logging según tipo de error
  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    user: req.user?.id || 'anonymous',
    ip: req.ip,
    params: req.params,
    query: req.query,
    body: req.body,
    error: err.errors || err.message
  };

  if (statusCode >= 500) {
    logger.error(`[Error 5xx] ${message}`, logPayload);

    // Respuesta genérica para errores 5xx
    return res.status(statusCode).json({
      code: statusCode,
      message: 'Internal server error. Please contact support.',
      payload: {
        error: ['Internal server error. Please contact support.']
      }
    });
  } else if (statusCode >= 400) {
    logger.warn(`[Error 4xx] ${message}`, logPayload);

    // Respuesta estándar para errores 4xx
    return res.status(statusCode).json({
      code: statusCode,
      message,
      payload: {
        error: Array.isArray(err.errors)
          ? err.errors
          : [err.errors || err.message || 'Unexpected error']
      }
    });
  }

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
module.exports.ApiError = ApiError;