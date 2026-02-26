const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    error = { success: false, message: 'Recurso no encontrado', statusCode: 404 };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { success: false, message: `El valor '${field}' ya existe`, statusCode: 400 };
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { success: false, message, statusCode: 400 };
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Error del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
