import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AccessibilityService } from '../../services/accessibility';
import { aiService } from '../../services/ai';
import { accessibilityRequestSchema } from '../schemas';
import { env } from '../../utils/env';

const accessibilityService = new AccessibilityService();

export const testHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = accessibilityRequestSchema.parse(req.body);
    const testResult = await accessibilityService.testAccessibility(request);

    const enableAI = req.body.enableAI === true;
    const aiApiKey = req.body.aiApiKey || env.OPENAI_API_KEY;
    const techStack = req.body.techStack;

    if (enableAI && aiApiKey && testResult.violations) {
      const aiResult = await aiService.processAccessibilityIssues(
        testResult.violations,
        {
          apiKey: aiApiKey,
          includeExplanations: true,
          includeRemediation: true,
          techStack,
        }
      );

      res.json({
        ...testResult,
        violations: aiResult.issues,
        aiEnabled: aiResult.enabled,
        aiError: aiResult.error,
      });
    } else {
      res.json(testResult);
    }
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
    const testResult = await accessibilityService.testMultiplePages(requests);

    const enableAI = req.body.enableAI === true;
    const aiApiKey = req.body.aiApiKey || env.OPENAI_API_KEY;
    const techStack = req.body.techStack;

    if (enableAI && aiApiKey) {
      const processedResults = await Promise.all(
        testResult.results.map(async (result) => {
          if (result.violations && Array.isArray(result.violations)) {
            const aiResult = await aiService.processAccessibilityIssues(
              result.violations,
              {
                apiKey: aiApiKey,
                includeExplanations: true,
                includeRemediation: true,
                techStack,
              }
            );

            return {
              ...result,
              violations: aiResult.issues,
              aiEnabled: aiResult.enabled,
              aiError: aiResult.error,
            };
          }
          return result;
        })
      );

      res.json({
        ...testResult,
        results: processedResults,
      });
    } else {
      res.json(testResult);
    }
  } catch (error) {
    next(error);
  }
};
