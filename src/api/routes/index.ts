import { Express } from 'express';
import { crawlHandler } from './crawl';
import { testHandler, testMultipleHandler } from './accessibility';
import { combinedHandler } from './combined';
import { healthHandler } from './health';
import { cacheStatsHandler, cacheClearHandler, cacheWarmHandler } from './cache';
import { requestTimeout } from '../middleware';
import webRoutes from './web';

export const setupRoutes = (app: Express) => {
  app.post('/api/crawl', requestTimeout(120000), crawlHandler);
  app.post('/api/test', requestTimeout(60000), testHandler);
  app.post('/api/test-multiple', requestTimeout(120000), testMultipleHandler);
  app.post('/api/combined', requestTimeout(180000), combinedHandler);
  app.get('/api/health', healthHandler);

  app.get('/api/cache/stats', cacheStatsHandler);
  app.delete('/api/cache/clear', cacheClearHandler);
  app.post('/api/cache/warm', requestTimeout(300000), cacheWarmHandler);

  app.use('/', webRoutes);
};
