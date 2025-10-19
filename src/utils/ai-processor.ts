import { createOpenAIService, isAIEnabled } from './openai';
import { OpenAIMessage } from '../services/openai';
import { AIPromptEngine, AIResponse } from './ai-prompts';
import { CacheService } from '../services/cache';
import { UserStoryService } from '../services/user-stories';
import { CacheKey } from '../types/cache';
import {
  AccessibilityIssue,
  AIProcessingOptions,
  AIProcessingResult,
  AIProcessedIssue,
} from '../types/ai';
import logger from './logger';

export class AIProcessor {
  private cacheService: CacheService;
  private userStoryService: UserStoryService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
    this.userStoryService = UserStoryService.getInstance();
  }

  async processAccessibilityIssues(
    issues: AccessibilityIssue[],
    options: AIProcessingOptions = {}
  ): Promise<AIProcessingResult> {
    const {
      apiKey,
      includeExplanations = true,
      includeRemediation = true,
      projectContext,
    } = options;

    const startTime = Date.now();
    let cacheHits = 0;
    let cacheMisses = 0;

    if (!isAIEnabled(apiKey)) {
      logger.info('AI processing disabled - no API key provided');
      return {
        enabled: false,
        issues,
        metadata: {
          cacheHits: 0,
          cacheMisses: 0,
          processingTime: Date.now() - startTime,
        },
      };
    }

    try {
      const openaiService = createOpenAIService(apiKey || '');

      if (!openaiService) {
        logger.error('Failed to initialize OpenAI service');
        return {
          enabled: false,
          issues,
          error: 'Failed to initialize OpenAI service',
          metadata: {
            cacheHits: 0,
            cacheMisses: 0,
            processingTime: Date.now() - startTime,
          },
        };
      }

      const processedIssues: AIProcessedIssue[] = [];

      for (const issue of issues) {
        const processedIssue: AIProcessedIssue = { ...issue };

        // Always add user story (regardless of AI processing)
        try {
          const userStory = await this.userStoryService.getUserStory(issue.id);
          if (userStory) {
            processedIssue.userStory = userStory;
          }
        } catch (error) {
          logger.warn('Failed to get user story', {
            issueId: issue.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        try {
          const { aiResponse, cacheHit } = await this.processIssueWithCache(
            openaiService,
            issue,
            projectContext
          );

          if (cacheHit) {
            cacheHits++;
          } else {
            cacheMisses++;
          }

          if (includeExplanations) {
            processedIssue.aiExplanation = aiResponse.plain_explanation;
          }

          if (includeRemediation) {
            processedIssue.aiRemediation = aiResponse.remediation;
          }
        } catch (error) {
          logger.warn('AI processing failed for issue', {
            issueId: issue.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          // Use fallback response
          const fallbackResponse = AIPromptEngine.createFallbackResponse(issue);

          if (includeExplanations) {
            processedIssue.aiExplanation = fallbackResponse.plain_explanation;
          }

          if (includeRemediation) {
            processedIssue.aiRemediation = fallbackResponse.remediation;
          }
        }

        processedIssues.push(processedIssue);
      }

      return {
        enabled: true,
        issues: processedIssues,
        metadata: {
          cacheHits,
          cacheMisses,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      logger.error('AI processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        enabled: true,
        issues,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          cacheHits,
          cacheMisses,
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  async processAccessibilityIssuesWithoutAI(
    issues: AccessibilityIssue[]
  ): Promise<AIProcessingResult> {
    const startTime = Date.now();
    const processedIssues: AIProcessedIssue[] = [];

    for (const issue of issues) {
      const processedIssue: AIProcessedIssue = { ...issue };

      try {
        const userStory = await this.userStoryService.getUserStory(issue.id);
        if (userStory) {
          processedIssue.userStory = userStory;
        }
      } catch (error) {
        logger.warn('Failed to get user story', {
          issueId: issue.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      processedIssues.push(processedIssue);
    }

    return {
      enabled: false,
      issues: processedIssues,
      metadata: {
        cacheHits: 0,
        cacheMisses: 0,
        processingTime: Date.now() - startTime,
      },
    };
  }

  private async processIssueWithCache(
    openaiService: {
      generateResponse: (
        messages: OpenAIMessage[]
      ) => Promise<{ content: string }>;
    },
    issue: AccessibilityIssue,
    projectContext?: {
      framework?: string;
      cssFramework?: string;
      language?: string;
      buildTool?: string;
      additionalContext?: string;
    }
  ): Promise<{ aiResponse: AIResponse; cacheHit: boolean }> {
    // Create cache key
    const cacheKey: CacheKey = {
      ruleId: issue.id,
      projectContext: projectContext || {},
    };

    // Try to get from cache first
    const cachedEntry = await this.cacheService.get(cacheKey);
    if (cachedEntry) {
      logger.info('Cache hit for AI response', { ruleId: issue.id });
      return { aiResponse: cachedEntry.value, cacheHit: true };
    }

    logger.info('Cache miss for AI response', { ruleId: issue.id });

    // Generate prompt using project context
    const messages = AIPromptEngine.generatePrompt(issue, projectContext);

    // Get response from OpenAI
    const response = await openaiService.generateResponse(messages);

    // Parse and validate response
    const aiResponse = AIPromptEngine.parseResponse(response.content, issue.id);

    // Cache the response
    try {
      await this.cacheService.set(cacheKey, aiResponse);
      logger.info('Cached AI response', { ruleId: issue.id });
    } catch (error) {
      logger.warn('Failed to cache AI response', {
        ruleId: issue.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return { aiResponse, cacheHit: false };
  }
}
