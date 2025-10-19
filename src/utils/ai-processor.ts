import { createOpenAIService, isAIEnabled } from './openai';
import { OpenAIMessage } from '../services/openai';
import { AI_PROMPTS } from './ai-prompts';
import {
  AccessibilityIssue,
  AIProcessingOptions,
  AIProcessingResult,
  AIProcessedIssue,
} from '../types/ai';
import logger from './logger';

export class AIProcessor {
  async processAccessibilityIssues(
    issues: AccessibilityIssue[],
    options: AIProcessingOptions = {}
  ): Promise<AIProcessingResult> {
    const {
      apiKey,
      includeExplanations = true,
      includeRemediation = true,
      techStack,
    } = options;

    if (!isAIEnabled(apiKey)) {
      return {
        enabled: false,
        issues,
      };
    }

    try {
      const openaiService = createOpenAIService(apiKey || '');

      if (!openaiService) {
        return {
          enabled: false,
          issues,
          error: 'Failed to initialize OpenAI service',
        };
      }

      const processedIssues: AIProcessedIssue[] = [];

      for (const issue of issues) {
        const processedIssue: AIProcessedIssue = { ...issue };

        if (includeExplanations) {
          processedIssue.aiExplanation = await this.generateExplanation(
            openaiService,
            issue,
            techStack
          );
        }

        if (includeRemediation) {
          processedIssue.aiRemediation = await this.generateRemediation(
            openaiService,
            issue,
            techStack
          );
        }

        processedIssues.push(processedIssue);
      }

      return {
        enabled: true,
        issues: processedIssues,
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
      };
    }
  }

  private async generateExplanation(
    openaiService: {
      generateResponse: (
        messages: OpenAIMessage[]
      ) => Promise<{ content: string }>;
    },
    issue: AccessibilityIssue,
    techStack?: string
  ): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: AI_PROMPTS.EXPLANATION_SYSTEM,
      },
      {
        role: 'user',
        content: AI_PROMPTS.EXPLANATION_USER(issue, techStack),
      },
    ];

    const response = await openaiService.generateResponse(messages);
    return response.content;
  }

  private async generateRemediation(
    openaiService: {
      generateResponse: (
        messages: OpenAIMessage[]
      ) => Promise<{ content: string }>;
    },
    issue: AccessibilityIssue,
    techStack?: string
  ): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: AI_PROMPTS.REMEDIATION_SYSTEM,
      },
      {
        role: 'user',
        content: AI_PROMPTS.REMEDIATION_USER(issue, techStack),
      },
    ];

    const response = await openaiService.generateResponse(messages);
    return response.content;
  }
}
