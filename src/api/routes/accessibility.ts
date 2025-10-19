import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AccessibilityService } from '../../services/accessibility';
import { aiService } from '../../services/ai';
import { accessibilityRequestSchema } from '../schemas';
import { env } from '../../utils/env';
import { AccessibilityRequest } from '../../types';
import { ProjectContext } from '../../utils/ai-prompts';

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
    const projectContext = req.body.projectContext;

    if (enableAI && aiApiKey && testResult.violations) {
      const aiResult = await aiService.processAccessibilityIssues(
        testResult.violations,
        {
          apiKey: aiApiKey,
          includeExplanations: true,
          includeRemediation: true,
          projectContext,
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
    // Parse request body - could be array or object with requests array
    let requests: AccessibilityRequest[];
    let enableAI = false;
    let aiApiKey: string | undefined;
    let projectContext: ProjectContext;

    if (Array.isArray(req.body)) {
      // Direct array format
      requests = z.array(accessibilityRequestSchema).parse(req.body);
    } else {
      // Object format with AI options
      const bodySchema = z.object({
        requests: z.array(accessibilityRequestSchema),
        enableAI: z.boolean().optional(),
        aiApiKey: z.string().optional(),
        projectContext: z
          .object({
            framework: z.string().optional(),
            cssFramework: z.string().optional(),
            language: z.string().optional(),
            buildTool: z.string().optional(),
            additionalContext: z.string().optional(),
          })
          .optional(),
      });

      const parsedBody = bodySchema.parse(req.body);
      requests = parsedBody.requests;
      enableAI = parsedBody.enableAI === true;
      aiApiKey = parsedBody.aiApiKey || env.OPENAI_API_KEY;
      projectContext = parsedBody.projectContext || {};
    }

    const testResult = await accessibilityService.testMultiplePages(requests);

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
                projectContext,
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
