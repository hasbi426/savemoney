// backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error("ERROR STACK:", err.stack); // Log the full error stack for debugging
  
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    // Handle Sequelize Unique Constraint Error specifically
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ // 409 Conflict
        status: 'error',
        message: err.errors && err.errors.length > 0 ? err.errors[0].message : 'A unique constraint was violated.',
        // field: err.errors && err.errors.length > 0 ? err.errors[0].path : null // Optional: which field caused it
      });
    }
    
    // Handle Sequelize Validation Error
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ // 400 Bad Request
          status: 'error',
          message: 'Validation failed.',
          errors: messages
      });
    }
  
    res.status(statusCode).json({
      status: 'error',
      message: message,
      // ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Optionally include stack in dev
    });
  };
  
  module.exports = errorHandler;