import { Request, Response, NextFunction } from 'express';
import { CrawlingService } from '../../services/crawling';
import { AccessibilityService } from '../../services/accessibility';
import { aiService } from '../../services/ai';
import { AccessibilityRequest } from '../../types';
import { combinedRequestSchema } from '../schemas';
import { env } from '../../utils/env';

const crawlingService = new CrawlingService();
const accessibilityService = new AccessibilityService();

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
      req.body.skipCache === true ||
      (request.testOptions?.skipCache === true);
    const testRequests: AccessibilityRequest[] = crawlResult.pages.map(
      (page) => ({
        url: page.url,
        includeScreenshot: true,
        skipCache,
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

        return {
          ...result,
          violations: aiResult.issues,
          aiEnabled: aiResult.enabled,
          aiError: aiResult.error,
          metadata: aiResult.metadata,
        };
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
