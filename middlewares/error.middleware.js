const ErrorResponse = require('../utils/error-response.utils');
const winston = require('./winston.middleware')

// 400-Bad Request, 404-Not Found, 500-Internal Server Error

const errorHandler = async (err, req, res, next) => {
  let error = { ...err }, errors = {};

  // unmanage transaction
  if (req.sequelizeTranSession) {
    await req.sequelizeTranSession.rollback();
    console.log("Rollback Transaction");
  }

  error.message = err.message;

  // Log to console for dev
  console.log(`${err}`.red);

  if (req.originalUrl === '/api/v3/auth/login') {
    Object.entries(req.cookies).forEach(([key, value]) => res.clearCookie(key));
  }

  // custom errors
  if (err.customErrors) {
    errors = err.customErrors;
  }

  // custom errors handled using joi
  if (err.JoiValidationError) {
    err.JoiValidationError.details.forEach(({ path, message }) => errors[path] = message);
    error = new ErrorResponse("Validation Error", 400);
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    err.errors.forEach(error => errors[error.path] = error.message);
    error = new ErrorResponse("Validation Error", 400);
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    error = new ErrorResponse('Duplicate field value entered', 400);
  }

  winston.error(`${error.statusCode || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    errors
  });
};

module.exports = errorHandler;
