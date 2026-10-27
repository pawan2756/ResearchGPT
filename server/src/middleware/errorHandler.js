import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
}

export function errorHandler(err, req, res, next) {
  // If response has already started streaming (SSE), delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const message = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: message || 'Invalid request parameters',
      },
    });
  }

  // Handle Known AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'A resource with this identifier already exists.',
      },
    });
  }

  // Handle JWT verification failures
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired authentication token',
      },
    });
  }

  // Internal Unhandled Errors
  logger.error({
    reqId: req.id,
    err: {
      message: err.message,
      stack: err.stack,
    },
  }, 'Unhandled server error');

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal server error occurred',
    },
  });
}
