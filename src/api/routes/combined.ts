import { Request, Response, NextFunction } from 'express';
import { CrawlingService } from '../../services/crawling';
import { AccessibilityService } from '../../services/accessibility';
import { ResponsiveService } from '../../services/responsive';
import { aiService } from '../../services/ai';
import { AccessibilityRequest } from '../../types';
import { CombinedPageResult } from '../../types/combined';
import { combinedRequestSchema } from '../schemas';
import { env } from '../../utils/env';
import logger from '../../utils/logger';

const crawlingService = new CrawlingService();
const accessibilityService = new AccessibilityService();
const responsiveService = new ResponsiveService();

export const combinedHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = combinedRequestSchema.parse(req.body);
    const startTime = Date.now();

    const crawlResult = await crawlingService.crawlWebsite({
      url: request.url,
      ...(request.crawlOptions || {}),
    });

    const skipCache =
      req.body.skipCache === true || request.testOptions?.skipCache === true;
    const customTests = request.testOptions?.customTests || [];
    const testRequests: AccessibilityRequest[] = crawlResult.pages.map(
      (page) => ({
        url: page.url,
        includeScreenshot: true,
        skipCache,
        customTests,
        customRulesConfig: request.testOptions?.customRulesConfig,
        customRulesPaths: request.testOptions?.customRulesPaths,
        disableDefaultRules: request.testOptions?.disableDefaultRules,
        enableDefaultRules: request.testOptions?.enableDefaultRules,
        includeApprovedRules:
          request.testOptions?.includeApprovedRules !== false,
        ...(request.testOptions || {}),
      })
    );

    const testResult =
      await accessibilityService.testMultiplePages(testRequests);

    const totalTime = Date.now() - startTime;

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

        const response: CombinedPageResult = {
          ...result,
          screenshot: result.screenshot,
          violations: aiResult.issues,
          aiEnabled: aiResult.enabled,
          aiError: aiResult.error,
          metadata: aiResult.metadata,
        };

        if (customTests.includes('responsive')) {
          if (!aiApiKey) {
            response.responsive = {
              error: 'AI API key is required for responsive testing',
              passed: false,
            };
          } else {
            try {
              if ((req as Request & { signal?: AbortSignal }).signal?.aborted) {
                throw new Error('Request aborted');
              }

              const responsiveResult = await responsiveService.testResponsive({
                url: result.url,
                timeout: request.testOptions?.timeout || 30000,
                skipCache,
                aiApiKey,
              });
              response.responsive = responsiveResult;
            } catch (error) {
              if ((req as Request & { signal?: AbortSignal }).signal?.aborted) {
                throw error;
              }
              logger.warn('Responsive test failed for page', {
                url: result.url,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
              response.responsive = {
                error: error instanceof Error ? error.message : 'Unknown error',
                passed: false,
              };
            }
          }
        }

        return response;
      })
    );

    const result = {
      crawl: {
        pages: crawlResult.pages,
        totalPages: crawlResult.totalPages,
        crawlTime: crawlResult.crawlTime,
      },
      accessibility: {
        results: processedResults,
        totalPages: processedResults.length,
        testTime: totalTime,
      },
      totalTime,
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
};
