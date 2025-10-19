export interface CombinedRequest {
  url: string;
  crawlOptions?: Partial<import('./crawling').CrawlRequest>;
  testOptions?: Partial<import('./accessibility').AccessibilityRequest>;
}

export interface CombinedResponse {
  crawl: import('./crawling').CrawlResponse;
  accessibility: import('./accessibility').AccessibilityResponse;
  totalTime: number;
}
