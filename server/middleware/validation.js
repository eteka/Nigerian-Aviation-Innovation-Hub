const Joi = require('joi');
const { logWarn } = require('../utils/logger');

// Common validation patterns
const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Please provide a valid email address',
  'any.required': 'Email is required'
});

const passwordSchema = Joi.string().min(8).required().messages({
  'string.min': 'Password must be at least 8 characters long',
  'any.required': 'Password is required'
});

const nameSchema = Joi.string().min(2).max(100).required().messages({
  'string.min': 'Name must be at least 2 characters long',
  'string.max': 'Name cannot exceed 100 characters',
  'any.required': 'Name is required'
});

const titleSchema = Joi.string().min(2).max(120).required().messages({
  'string.min': 'Title must be at least 2 characters long',
  'string.max': 'Title cannot exceed 120 characters',
  'any.required': 'Title is required'
});

const descriptionSchema = Joi.string().min(10).max(5000).required().messages({
  'string.min': 'Description must be at least 10 characters long',
  'string.max': 'Description cannot exceed 5000 characters',
  'any.required': 'Description is required'
});

const categorySchema = Joi.string().valid('Aircraft Tech', 'Operations', 'Sustainable Fuel', 'Offsets').required().messages({
  'any.only': 'Category must be one of: Aircraft Tech, Operations, Sustainable Fuel, Offsets',
  'any.required': 'Category is required'
});

const statusSchema = Joi.string().valid('Submitted', 'Under Review', 'Feedback Provided', 'In Progress', 'Completed').required().messages({
  'any.only': 'Status must be one of: Submitted, Under Review, Feedback Provided, In Progress, Completed',
  'any.required': 'Status is required'
});

const roleSchema = Joi.string().valid('innovator', 'regulator').required().messages({
  'any.only': 'Role must be either innovator or regulator',
  'any.required': 'Role is required'
});

// Validation schemas for different endpoints
const schemas = {
  // Auth endpoints
  register: Joi.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    adminRequested: Joi.boolean().optional(),
    adminKey: Joi.string().optional()
  }),

  login: Joi.object({
    email: emailSchema,
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  requestAdmin: Joi.object({
    reason: Joi.string().min(10).max(1000).optional().messages({
      'string.min': 'Reason must be at least 10 characters long',
      'string.max': 'Reason cannot exceed 1000 characters'
    })
  }),

  // Project endpoints
  createProject: Joi.object({
    title: titleSchema,
    description: descriptionSchema,
    category: categorySchema
  }),

  updateProject: Joi.object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    category: categorySchema.optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  // Admin endpoints
  updateProjectStatus: Joi.object({
    status: statusSchema
  }),

  updateUserRole: Joi.object({
    role: roleSchema
  })
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next(new Error(`Validation schema '${schemaName}' not found`));
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logWarn('Validation failed', {
        endpoint: req.path,
        errors: validationErrors,
        body: req.body
      }, req);

      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: validationErrors
        },
        requestId: req.requestId
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Parameter validation for IDs
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const idSchema = Joi.number().integer().positive().required();
    
    const { error } = idSchema.validate(id);
    if (error) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: `Invalid ${paramName}: must be a positive integer`
        },
        requestId: req.requestId
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateId,
  schemas
};