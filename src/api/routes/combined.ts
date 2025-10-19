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

    const testRequests: AccessibilityRequest[] = crawlResult.pages.map(
      (page) => ({
        url: page.url,
        includeScreenshot: true,
        ...(request.testOptions || {}),
      })
    );

    const testResult =
      await accessibilityService.testMultiplePages(testRequests);

    const totalTime = Date.now() - startTime;

    const result = {
      results: testResult.results.map((test, index) => ({
        url: crawlResult.pages[index]?.url || test.url,
        issues: test.violations,
        screenshot: test.screenshot,
        timestamp: test.timestamp,
      })),
      summary: {
        totalIssues: testResult.results.reduce((sum, test) => sum + test.violations.length, 0),
        totalUrls: crawlResult.pages.length,
      },
      crawl: crawlResult,
      accessibility: testResult,
      totalTime,
    };

    // Check if AI processing is requested
    const enableAI = req.body.enableAI === true;
    const aiApiKey = req.body.aiApiKey || env.OPENAI_API_KEY;
    const techStack = req.body.techStack;
    
    if (enableAI && aiApiKey) {
      const aiResult = await aiService.processCombinedResults(result, {
        apiKey: aiApiKey,
        includeExplanations: true,
        includeRemediation: true,
        techStack,
      });
      
      res.json(aiResult);
    } else {
      res.json(result);
    }
  } catch (error) {
    next(error);
  }
};
