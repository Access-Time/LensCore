import { Request, Response } from 'express';

export const healthHandler = async (_req: Request, res: Response) => {
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
};
