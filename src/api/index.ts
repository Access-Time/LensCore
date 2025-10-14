import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import { CrawlingService } from '../services/crawling';
import { AccessibilityService } from '../services/accessibility';
import { AccessibilityRequest } from '../types';
import { env } from '../utils/env';
import logger from '../utils/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const crawlingService = new CrawlingService();
const accessibilityService = new AccessibilityService();

const crawlRequestSchema = z.object({
  url: z.string().url(),
  maxUrls: z.number().min(1).max(100).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  concurrency: z.number().min(1).max(10).optional(),
  waitUntil: z
    .enum(['domcontentloaded', 'networkidle0', 'networkidle2'])
    .optional(),
  headers: z.record(z.string()).optional(),
  auth: z
    .object({
      username: z.string(),
      password: z.string(),
    })
    .optional(),
});

const accessibilityRequestSchema = z.object({
  url: z.string().url(),
  timeout: z.number().min(1000).max(60000).optional(),
  includeScreenshot: z.boolean().optional(),
  rules: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const combinedRequestSchema = z.object({
  url: z.string().url(),
  crawlOptions: crawlRequestSchema.partial().optional(),
  testOptions: accessibilityRequestSchema.partial().optional(),
});

app.post(
  '/api/crawl',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = crawlRequestSchema.parse(req.body);
      const result = await crawlingService.crawlWebsite(request);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  '/api/test',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = accessibilityRequestSchema.parse(req.body);
      const result = await accessibilityService.testAccessibility(request);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  '/api/test-multiple',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requests = z.array(accessibilityRequestSchema).parse(req.body);
      const result = await accessibilityService.testMultiplePages(requests);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  '/api/combined',
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy' as const,
      timestamp: new Date(),
      services: {
        crawling: 'up' as const,
        accessibility: 'up' as const,
        storage: 'up' as const,
      },
    };
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy' as const,
      timestamp: new Date(),
      services: {
        crawling: 'down' as const,
        accessibility: 'down' as const,
        storage: 'down' as const,
      },
    });
  }
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('API Error', { error: error.message, stack: error.stack });

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.errors,
    });
  }

  return res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
  });
});

if (process.env['NODE_ENV'] !== 'test') {
  const server = app.listen(env.PORT, () => {
    logger.info(`LensCore server running on port ${env.PORT}`);
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await crawlingService.close();
    await accessibilityService.close();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await crawlingService.close();
    await accessibilityService.close();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

export default app;
