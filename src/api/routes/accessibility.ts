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
): Promise<void> => {
  try {
    const request = accessibilityRequestSchema.parse(req.body);

    const enableAI = req.body.enableAI === true;
    const aiApiKey = req.body.aiApiKey || env.OPENAI_API_KEY;
    const projectContext = req.body.projectContext;

    if (enableAI && !aiApiKey) {
      res.status(400).json({
        error: 'AI API key is required when enableAI is true',
        message:
          'Please provide aiApiKey in request body or set OPENAI_API_KEY environment variable',
      });
      return;
    }

    const testResult = await accessibilityService.testAccessibility(request);

    if (testResult.violations) {
      const aiResult = await aiService.processAccessibilityIssues(
        testResult.violations,
        {
          apiKey: enableAI ? aiApiKey : undefined,
          includeExplanations: enableAI,
          includeRemediation: enableAI,
          projectContext,
        }
      );

      res.json({
        ...testResult,
        violations: aiResult.issues,
        aiEnabled: aiResult.enabled,
        aiError: aiResult.error,
        metadata: aiResult.metadata,
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
    let requests: AccessibilityRequest[];
    let enableAI = false;
    let aiApiKey: string | undefined;
    let projectContext: ProjectContext;

    if (Array.isArray(req.body)) {
      requests = z.array(accessibilityRequestSchema).parse(req.body);
    } else {
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

    const processedResults = await Promise.all(
      testResult.results.map(async (result) => {
        if (result.violations && Array.isArray(result.violations)) {
          const aiResult = await aiService.processAccessibilityIssues(
            result.violations,
            {
              apiKey: enableAI ? aiApiKey : undefined,
              includeExplanations: enableAI,
              includeRemediation: enableAI,
              projectContext,
            }
          );

          return {
            ...result,
            violations: aiResult.issues,
            aiEnabled: aiResult.enabled,
            aiError: aiResult.error,
            metadata: aiResult.metadata,
          };
        }
        return result;
      })
    );

    res.json({
      ...testResult,
      results: processedResults,
    });
  } catch (error) {
    next(error);
  }
};
