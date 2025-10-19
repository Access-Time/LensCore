import { AIProcessor } from '../utils/ai-processor';
import { CacheService } from './cache';
import { createCacheConfig } from '../config/cache';
import {
  AccessibilityIssue,
  AIProcessingOptions,
  AICrawlResult,
  CombinedResult,
} from '../types/ai';

export class AIService {
  private processor: AIProcessor;

  constructor() {
    const cacheConfig = createCacheConfig();
    const cacheService = CacheService.getInstance(cacheConfig);
    this.processor = new AIProcessor(cacheService);
  }

  async processAccessibilityIssues(
    issues: AccessibilityIssue[],
    options: AIProcessingOptions = {}
  ) {
    return this.processor.processAccessibilityIssues(issues, options);
  }

  async processCrawlResults(
    crawlResults: AICrawlResult,
    options: AIProcessingOptions = {}
  ): Promise<AICrawlResult & { aiEnabled: boolean; aiError?: string }> {
    if (!crawlResults.issues || !Array.isArray(crawlResults.issues)) {
      return {
        ...crawlResults,
        aiEnabled: false,
      };
    }

    const aiResult = await this.processor.processAccessibilityIssues(
      crawlResults.issues,
      options
    );

    return {
      ...crawlResults,
      issues: aiResult.issues,
      aiEnabled: aiResult.enabled,
      aiError: aiResult.error,
    };
  }

  async processCombinedResults(
    combinedResults: CombinedResult,
    options: AIProcessingOptions = {}
  ): Promise<CombinedResult> {
    if (!combinedResults.results || !Array.isArray(combinedResults.results)) {
      return combinedResults;
    }

    const processedResults = await Promise.all(
      combinedResults.results.map(async (result: AICrawlResult) => {
        if (result.issues && Array.isArray(result.issues)) {
          const aiResult = await this.processor.processAccessibilityIssues(
            result.issues,
            options
          );
          return {
            ...result,
            issues: aiResult.issues,
            aiEnabled: aiResult.enabled,
            aiError: aiResult.error,
          };
        }
        return result;
      })
    );

    return {
      ...combinedResults,
      results: processedResults,
    };
  }
}

export const aiService = new AIService();
