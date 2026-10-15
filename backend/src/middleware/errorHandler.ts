import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode = 400, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Handle Zod Validation Error (check instance and name for monorepo safety)
  if (err instanceof ZodError || err.name === 'ZodError' || Array.isArray(err.issues)) {
    const issues = err.errors || err.issues || [];
    const formattedErrors = issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: 'Validation failed.',
      validationErrors: formattedErrors,
    });
  }

  // Handle Custom Application Error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'A record with that unique value already exists.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found.',
    });
  }

  // Generic internal server error - never leak stack trace
  console.error('[Internal Server Error]', err);
  return res.status(500).json({
    success: false,
    error: 'An unexpected internal error occurred. Please try again later.',
  });
}
