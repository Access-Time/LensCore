import { createApp } from './config';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware';
import { CrawlingService } from '../services/crawling';
import { AccessibilityService } from '../services/accessibility';
import { env } from '../utils/env';
import logger from '../utils/logger';

const app = createApp();

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use(errorHandler);

// Server startup and graceful shutdown
if (process.env['NODE_ENV'] !== 'test') {
  const crawlingService = new CrawlingService();
  const accessibilityService = new AccessibilityService();

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
