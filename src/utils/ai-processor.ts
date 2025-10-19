import { createOpenAIService, isAIEnabled } from './openai';
import { OpenAIMessage } from '../services/openai';
import { AIPromptEngine, AIResponse } from './ai-prompts';
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
      projectContext,
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

        try {
          const aiResponse = await this.processIssueWithAI(
            openaiService,
            issue,
            projectContext
          );

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

  private async processIssueWithAI(
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
  ): Promise<AIResponse> {
    // Generate prompt using project context
    const messages = AIPromptEngine.generatePrompt(issue, projectContext);

    // Get response from OpenAI
    const response = await openaiService.generateResponse(messages);

    // Parse and validate response
    return AIPromptEngine.parseResponse(response.content, issue.id);
  }
}
