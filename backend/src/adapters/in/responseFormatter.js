/**
 * Middleware para estandarizar todas las respuestas de la API.
 * Formato:
 * {
 *   code: HTTP status code,
 *   message: string,
 *   payload: { resultado o { error: [array de errores] }
 *   }
 * }
 */
function responseFormatter(req, res, next) {
  // Guarda la referencia original de res.json
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    // Si ya está formateado, no lo modifica
    if (data && data.code && data.message && data.payload) {
      return originalJson(data);
    }

    // Determina el status code (por defecto 200)
    const statusCode = res.statusCode || 200;

    // Si es un error, espera que data tenga { error: [...] }
    if (statusCode >= 400) {
      return originalJson({
        code: statusCode,
        message: res.locals.message || 'Error',
        payload: {
          error: Array.isArray(data.error) ? data.error : [data.error || 'Unexpected error']
        }
      });
    }

    // Respuesta exitosa
    return originalJson({
      code: statusCode,
      message: res.locals.message || 'success',
      payload: data
    });
  };

  next();
}

module.exports = responseFormatter;