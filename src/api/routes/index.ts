import { Express } from 'express';
import { crawlHandler } from './crawl';
import { testHandler, testMultipleHandler } from './accessibility';
import { combinedHandler } from './combined';
import { healthHandler } from './health';
import { cacheStatsHandler, cacheClearHandler } from './cache';

export const setupRoutes = (app: Express) => {
  app.post('/api/crawl', crawlHandler);
  app.post('/api/test', testHandler);
  app.post('/api/test-multiple', testMultipleHandler);
  app.post('/api/combined', combinedHandler);
  app.get('/api/health', healthHandler);

  // Cache management endpoints
  app.get('/api/cache/stats', cacheStatsHandler);
  app.delete('/api/cache/clear', cacheClearHandler);
};
