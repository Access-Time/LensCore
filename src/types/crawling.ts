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
