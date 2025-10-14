import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AccessibilityService } from '../../services/accessibility';
import { accessibilityRequestSchema } from '../schemas';

const accessibilityService = new AccessibilityService();

export const testHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = accessibilityRequestSchema.parse(req.body);
    const result = await accessibilityService.testAccessibility(request);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const testMultipleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requests = z.array(accessibilityRequestSchema).parse(req.body);
    const result = await accessibilityService.testMultiplePages(requests);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
