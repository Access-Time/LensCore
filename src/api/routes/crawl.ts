import { Request, Response, NextFunction } from 'express';
import { CrawlingService } from '../../services/crawling';
import { crawlRequestSchema } from '../schemas';

const crawlingService = new CrawlingService();

export const crawlHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = crawlRequestSchema.parse(req.body);
    const result = await crawlingService.crawlWebsite(request);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
