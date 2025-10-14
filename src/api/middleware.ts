import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('API Error', { error: error.message, stack: error.stack });

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.errors,
    });
  }

  return res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
  });
};
