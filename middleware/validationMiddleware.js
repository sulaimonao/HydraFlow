// middleware/validationMiddleware.js

/**
 * Middleware to validate incoming request data against a provided schema.
 * Supports validation for body, query, and headers.
 *
 * @param {Object} schema - Joi schema for validation.
 * @param {string} target - The request part to validate ('body', 'query', or 'headers').
 */
export const validateRequest = (schema, target = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[target], { abortEarly: false });  // Show all errors

  if (error) {
    console.warn(`❌ Validation failed: ${error.details.map(e => e.message).join(', ')}`);
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(err => err.message),  // Return all validation errors
    });
  }

  next();  // Proceed if validation passes
};
