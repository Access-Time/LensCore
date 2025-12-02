import { AccessibilityResult } from './accessibility';
import { ResponsiveTestResult } from './responsive';
import { AIProcessedIssue } from './ai';

export interface CombinedRequest {
  url: string;
  crawlOptions?: Partial<import('./crawling').CrawlRequest>;
  testOptions?: Partial<import('./accessibility').AccessibilityRequest>;
}

export interface CombinedPageResult
  extends Omit<AccessibilityResult, 'violations'> {
  violations: AIProcessedIssue[];
  aiEnabled?: boolean;
  aiError?: string;
  metadata?: {
    enabled?: boolean;
    error?: string;
    processingTime?: number;
  };
  responsive?:
    | ResponsiveTestResult
    | {
        error: string;
        passed: false;
      };
}

export interface CombinedResponse {
  crawl: import('./crawling').CrawlResponse;
  accessibility: {
    results: CombinedPageResult[];
    totalPages: number;
    testTime: number;
  };
  totalTime: number;
}
