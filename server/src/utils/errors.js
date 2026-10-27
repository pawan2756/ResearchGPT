export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please slow down and try again later.', code = 'RATE_LIMITED') {
    super(message, 429, code);
  }
}

export class BadGatewayError extends AppError {
  constructor(message = 'Upstream service failure', code = 'BAD_GATEWAY') {
    super(message, 502, code);
  }
}
