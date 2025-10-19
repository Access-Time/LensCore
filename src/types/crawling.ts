export interface CrawlResult {
  url: string;
  title: string;
  description: string;
  statusCode: number;
  timestamp: Date;
}

export interface CrawlRules {
  include_subdomains?: boolean;
  follow_external?: boolean;
  exclude_paths?: string[];
  include_paths?: string[];
  respect_robots?: boolean;
}

export interface CrawlRequest {
  url: string;
  max_depth?: number;
  maxUrls?: number;
  timeout?: number;
  concurrency?: number;
  waitUntil?: 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  headers?: Record<string, string>;
  rules?: CrawlRules;
}

export interface CrawlResponse {
  pages: CrawlResult[];
  totalPages: number;
  crawlTime: number;
}
