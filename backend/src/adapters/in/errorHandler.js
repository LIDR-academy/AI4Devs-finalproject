function errorHandler(err, req, res, next) {
  // Si el error tiene status, úsalo; si no, 500
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      type: err.name || 'Error',
      status,
    },
  });
}

module.exports = errorHandler;