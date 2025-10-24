import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';

export const requestTimeout = (timeoutMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    (req as Request & { signal: AbortSignal }).signal = controller.signal;

    req.on('close', () => {
      clearTimeout(timeoutId);
    });

    req.on('aborted', () => {
      clearTimeout(timeoutId);
    });

    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  if (error.name === 'AbortError' || error.message.includes('aborted')) {
    res.status(408).json({
      error: 'Request timeout',
      message: 'The request took too long to complete',
    });
    return;
  }

  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: 'Validation error',
      message: 'Invalid request data',
      details: error.errors,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
  });
};
