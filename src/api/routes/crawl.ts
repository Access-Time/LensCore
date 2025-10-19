import { Request, Response, NextFunction } from 'express';
import { CrawlingService } from '../../services/crawling';
import { aiService } from '../../services/ai';
import { crawlRequestSchema } from '../schemas';
import { env } from '../../utils/env';

const crawlingService = new CrawlingService();

export const crawlHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = crawlRequestSchema.parse(req.body);
    const crawlResult = await crawlingService.crawlWebsite(request);

    const enableAI = req.body.enableAI === true;
    const aiApiKey = req.body.aiApiKey || env.OPENAI_API_KEY;
    const projectContext = req.body.projectContext;

    if (enableAI && aiApiKey) {
      const crawlData = {
        issues: [],
        url: request.url,
        timestamp: new Date(),
        ...crawlResult,
      };

      const aiResult = await aiService.processCrawlResults(crawlData, {
        apiKey: aiApiKey,
        includeExplanations: true,
        includeRemediation: true,
        projectContext,
      });

      res.json(aiResult);
    } else {
      res.json(crawlResult);
    }
  } catch (error) {
    next(error);
  }
};
