import { Express } from 'express';
import { crawlHandler } from './crawl';
import { testHandler, testMultipleHandler } from './accessibility';
import { combinedHandler } from './combined';
import { healthHandler } from './health';
import aiRouter from './ai';

export const setupRoutes = (app: Express) => {
  app.post('/api/crawl', crawlHandler);
  app.post('/api/test', testHandler);
  app.post('/api/test-multiple', testMultipleHandler);
  app.post('/api/combined', combinedHandler);
  app.get('/api/health', healthHandler);
  app.use('/api/ai', aiRouter);
};
