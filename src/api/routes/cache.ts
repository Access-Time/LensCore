import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../../services/cache';
import { createCacheConfig } from '../../config/cache';

const cacheService = CacheService.getInstance(createCacheConfig());

export const cacheStatsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await cacheService.getStats();
    res.json({
      status: 'success',
      data: {
        ...stats,
        hitRatePercentage: Math.round(stats.hitRate * 100),
        cacheType: process.env['CACHE_TYPE'] || 'memory',
        ttl: process.env['CACHE_TTL'] || '7200',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cacheClearHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await cacheService.clear();
    res.json({
      status: 'success',
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const cacheWarmHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { urls } = req.body;
    
    if (!Array.isArray(urls) || urls.length === 0) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'URLs array is required',
      });
      return;
    }

    const results = [];
    for (const url of urls.slice(0, 5)) {
      try {
        const { CrawlingService } = await import('../../services/crawling');
        const { AccessibilityService } = await import('../../services/accessibility');
        
        const crawlingService = new CrawlingService();
        const accessibilityService = new AccessibilityService();
        
        const crawlResult = await crawlingService.crawlWebsite({ url });
        const testResult = await accessibilityService.testAccessibility({ url });
        
        results.push({
          url,
          status: 'success',
          pagesCrawled: crawlResult.totalPages,
          accessibilityScore: testResult.score,
        });
        
        await crawlingService.close();
        await accessibilityService.close();
      } catch (error) {
        results.push({
          url,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    res.json({
      status: 'success',
      message: 'Cache warming completed',
      results,
    });
  } catch (error) {
    next(error);
  }
};
