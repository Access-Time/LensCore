import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AccessibilityService } from '../../services/accessibility';
import { aiService } from '../../services/ai';
import { ResponsiveService } from '../../services/responsive';
import { accessibilityRequestSchema } from '../schemas';
import { env } from '../../utils/env';
import { AccessibilityRequest, AccessibilityTestResponse } from '../../types';
import { ProjectContext } from '../../utils/ai-prompts';

const accessibilityService = new AccessibilityService();
const responsiveService = new ResponsiveService();

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
    const customTests = request.customTests || [];

    if (enableAI && !aiApiKey) {
      res.status(400).json({
        error: 'AI API key is required when enableAI is true',
        message:
          'Please provide aiApiKey in request body or set OPENAI_API_KEY environment variable',
      });
      return;
    }

    const accessibilityRequest: AccessibilityRequest = {
      ...request,
      customRulesConfig: request.customRulesConfig,
      customRulesPaths: request.customRulesPaths,
      disableDefaultRules: request.disableDefaultRules,
      enableDefaultRules: request.enableDefaultRules,
      includeApprovedRules: request.includeApprovedRules !== false,
    };

    const testResult =
      await accessibilityService.testAccessibility(accessibilityRequest);

    if (testResult.violations && testResult.violations.length > 0) {
      const aiResult = await aiService.processAccessibilityIssues(
        testResult.violations,
        {
          apiKey: enableAI ? aiApiKey : undefined,
          includeExplanations: enableAI,
          includeRemediation: enableAI,
          projectContext,
        }
      );

      const response: AccessibilityTestResponse = {
        ...testResult,
        violations: aiResult.issues,
        aiEnabled: aiResult.enabled,
        aiError: aiResult.error,
        metadata: aiResult.metadata,
        customRules: testResult.customRules || [],
      };

      if (customTests.includes('responsive')) {
        if (!aiApiKey) {
          response.responsive = {
            error: 'AI API key is required for responsive testing',
            passed: false,
          };
        } else {
          try {
            const responsiveResult = await responsiveService.testResponsive({
              url: request.url,
              timeout: request.timeout,
              skipCache: request.skipCache,
              aiApiKey,
            });
            response.responsive = responsiveResult;
          } catch (error) {
            response.responsive = {
              error: error instanceof Error ? error.message : 'Unknown error',
              passed: false,
            };
          }
        }
      }

      res.json(response);
    } else {
      const aiResult = await aiService.processAccessibilityIssues(
        testResult.violations || [],
        {
          apiKey: enableAI ? aiApiKey : undefined,
          includeExplanations: enableAI,
          includeRemediation: enableAI,
          projectContext,
        }
      );

      const response: AccessibilityTestResponse = {
        ...testResult,
        violations: aiResult.issues,
        aiEnabled: aiResult.enabled,
        aiError: aiResult.error,
        metadata: aiResult.metadata,
        customRules: testResult.customRules || [],
      };

      if (customTests.includes('responsive')) {
        if (!aiApiKey) {
          response.responsive = {
            error: 'AI API key is required for responsive testing',
            passed: false,
          };
        } else {
          try {
            const responsiveResult = await responsiveService.testResponsive({
              url: request.url,
              timeout: request.timeout,
              skipCache: request.skipCache,
              aiApiKey,
            });
            response.responsive = responsiveResult;
          } catch (error) {
            response.responsive = {
              error: error instanceof Error ? error.message : 'Unknown error',
              passed: false,
            };
          }
        }
      }

      res.json(response);
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
      const firstRequest = req.body[0];
      enableAI = firstRequest?.enableAI === true;
      aiApiKey = firstRequest?.aiApiKey || env.OPENAI_API_KEY;
      projectContext = firstRequest?.projectContext || {};
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

    if (enableAI && !aiApiKey) {
      res.status(400).json({
        error: 'AI API key is required when enableAI is true',
        message:
          'Please provide aiApiKey in request body or set OPENAI_API_KEY environment variable',
      });
      return;
    }

    const testResult = await accessibilityService.testMultiplePages(requests);

    const processedResults = await Promise.all(
      testResult.results.map(async (result) => {
        const violations = result.violations || [];
        const aiResult = await aiService.processAccessibilityIssues(
          violations,
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
          customRules: result.customRules || [],
        };
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
