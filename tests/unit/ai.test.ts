import { AIService } from '../../src/services/ai';
import { AccessibilityIssue, AIProcessingOptions, AICrawlResult } from '../../src/types/ai';

jest.mock('../../src/services/cache', () => ({
  CacheService: {
    getInstance: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      getStats: jest.fn(),
      disconnect: jest.fn()
    }))
  }
}));

jest.mock('../../src/utils/ai-processor', () => ({
  AIProcessor: jest.fn().mockImplementation(() => ({
    processAccessibilityIssues: jest.fn().mockResolvedValue({
      enabled: true,
      issues: [],
      metadata: {
        cacheHits: 0,
        cacheMisses: 1,
        processingTime: 100
      }
    }),
    processAccessibilityIssuesWithoutAI: jest.fn().mockResolvedValue({
      enabled: false,
      issues: [],
      metadata: {
        cacheHits: 0,
        cacheMisses: 0,
        processingTime: 0
      }
    })
  }))
}));

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  const mockIssues: AccessibilityIssue[] = [
    {
      id: 'color-contrast',
      impact: 'serious',
      description: 'Elements must have sufficient color contrast',
      help: 'Ensure all text elements have sufficient color contrast',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
      nodes: [
        {
          target: ['h1'],
          html: '<h1>Low contrast text</h1>',
          failureSummary: 'Fix any of the following: Element has insufficient color contrast'
        }
      ]
    }
  ];

  describe('processAccessibilityIssues', () => {
    it('should process accessibility issues with AI when apiKey is provided', async () => {
      const options: AIProcessingOptions = {
        apiKey: 'test-api-key',
        includeExplanations: true,
        includeRemediation: true
      };

      const result = await aiService.processAccessibilityIssues(mockIssues, options);

      expect(result).toHaveProperty('enabled');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('metadata');
      expect(result.enabled).toBe(true);
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('should process accessibility issues without AI when apiKey is not provided', async () => {
      const options: AIProcessingOptions = {};

      const result = await aiService.processAccessibilityIssues(mockIssues, options);

      expect(result).toHaveProperty('enabled');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('metadata');
      expect(result.enabled).toBe(false);
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('should handle empty issues array', async () => {
      const result = await aiService.processAccessibilityIssues([]);

      expect(result).toHaveProperty('enabled');
      expect(result).toHaveProperty('issues');
      expect(result.issues).toEqual([]);
    });
  });

  describe('processCrawlResults', () => {
    it('should process crawl results with AI', async () => {
      const crawlResults = {
        issues: mockIssues,
        url: 'https://example.com',
        timestamp: new Date()
      };

      const options: AIProcessingOptions = {
        apiKey: 'test-api-key'
      };

      const result = await aiService.processCrawlResults(crawlResults, options);

      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('aiEnabled');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('timestamp');
      expect(result.aiEnabled).toBe(true);
    });

    it('should handle crawl results without issues', async () => {
      const crawlResults = {
        issues: [],
        url: 'https://example.com',
        timestamp: new Date()
      };

      const result = await aiService.processCrawlResults(crawlResults);

      expect(result).toHaveProperty('aiEnabled');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('timestamp');
      expect(result.aiEnabled).toBe(true);
    });

    it('should handle crawl results with non-array issues', async () => {
      const crawlResults = {
        issues: 'invalid-issues' as unknown as AccessibilityIssue[],
        url: 'https://example.com',
        timestamp: new Date()
      };

      const result = await aiService.processCrawlResults(crawlResults);

      expect(result).toHaveProperty('aiEnabled');
      expect(result.aiEnabled).toBe(false);
    });
  });

  describe('processCombinedResults', () => {
    it('should process combined results with multiple crawl results', async () => {
      const combinedResults = {
        results: [
          {
            issues: mockIssues,
            url: 'https://example.com/page1',
            timestamp: new Date()
          },
          {
            issues: mockIssues,
            url: 'https://example.com/page2',
            timestamp: new Date()
          }
        ],
        summary: {
          totalIssues: 2,
          totalUrls: 2
        }
      };

      const options: AIProcessingOptions = {
        apiKey: 'test-api-key'
      };

      const result = await aiService.processCombinedResults(combinedResults, options);

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('summary');
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results).toHaveLength(2);
    });

    it('should handle combined results without results array', async () => {
      const combinedResults = {
        results: [],
        summary: {
          totalIssues: 0,
          totalUrls: 0
        }
      };

      const result = await aiService.processCombinedResults(combinedResults);

      expect(result).toHaveProperty('summary');
      expect(result.results).toEqual([]);
    });

    it('should handle combined results with non-array results', async () => {
      const combinedResults = {
        results: 'invalid-results' as unknown as AICrawlResult[],
        summary: {
          totalIssues: 0,
          totalUrls: 0
        }
      };

      const result = await aiService.processCombinedResults(combinedResults);

      expect(result).toHaveProperty('summary');
      expect(result.results).toBe('invalid-results');
    });

    it('should process results with and without issues', async () => {
      const combinedResults = {
        results: [
          {
            issues: mockIssues,
            url: 'https://example.com/page1',
            timestamp: new Date()
          },
          {
            issues: [],
            url: 'https://example.com/page2',
            timestamp: new Date()
          }
        ]
      };

      const result = await aiService.processCombinedResults(combinedResults);

      expect(result).toHaveProperty('results');
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results).toHaveLength(2);
    });
  });
});
