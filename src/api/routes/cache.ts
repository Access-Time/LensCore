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
      data: stats,
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
