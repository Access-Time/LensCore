import { Request, Response, NextFunction } from 'express';
import { CrawlingService } from '../../services/crawling';
import { AccessibilityService } from '../../services/accessibility';
import { AccessibilityRequest } from '../../types';
import { combinedRequestSchema } from '../schemas';

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

    res.json({
      crawl: crawlResult,
      accessibility: testResult,
      totalTime,
    });
  } catch (error) {
    next(error);
  }
};
