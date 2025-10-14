export interface CrawlResult {
  url: string;
  title: string;
  description: string;
  statusCode: number;
  timestamp: Date;
}

export interface CrawlRequest {
  url: string;
  maxUrls?: number;
  timeout?: number;
  concurrency?: number;
  waitUntil?: 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  headers?: Record<string, string>;
  auth?: {
    username: string;
    password: string;
  };
}

export interface CrawlResponse {
  pages: CrawlResult[];
  totalPages: number;
  crawlTime: number;
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary: string;
  }>;
}

export interface AccessibilityResult {
  url: string;
  score: number;
  violations: AccessibilityViolation[];
  passes: AccessibilityViolation[];
  incomplete: AccessibilityViolation[];
  inapplicable: AccessibilityViolation[];
  screenshot?: string | undefined;
  timestamp: Date;
}

export interface AccessibilityRequest {
  url: string;
  timeout?: number;
  includeScreenshot?: boolean;
  rules?: string[];
  tags?: string[];
}

export interface AccessibilityResponse {
  results: AccessibilityResult[];
  totalPages: number;
  testTime: number;
}

export interface CombinedRequest {
  url: string;
  crawlOptions?: Partial<CrawlRequest>;
  testOptions?: Partial<AccessibilityRequest>;
}

export interface CombinedResponse {
  crawl: CrawlResponse;
  accessibility: AccessibilityResponse;
  totalTime: number;
}

export interface StorageConfig {
  type: 'local' | 's3' | 'gcs';
  path?: string;
  bucket?: string;
  region?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    keyFile?: string;
  };
}

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
