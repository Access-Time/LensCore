export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  services: {
    crawling: 'up' | 'down';
    accessibility: 'up' | 'down';
    storage: 'up' | 'down';
  };
}
