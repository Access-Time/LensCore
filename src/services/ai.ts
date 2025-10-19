import { createOpenAIService, isAIEnabled } from '../utils/openai';
import { OpenAIMessage } from '../services/openai';
import logger from '../utils/logger';

export interface AccessibilityIssue {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary?: string;
  }>;
}

export interface AIProcessingOptions {
  apiKey?: string;
  includeExplanations?: boolean;
  includeRemediation?: boolean;
  techStack?: string;
}

export interface AIProcessedIssue extends AccessibilityIssue {
  aiExplanation?: string;
  aiRemediation?: string;
}

export interface AIProcessingResult {
  enabled: boolean;
  issues: AIProcessedIssue[];
  error?: string;
}

export interface AICrawlResult {
  issues: AccessibilityIssue[];
  url?: string;
  timestamp?: Date;
  [key: string]: unknown;
}

export interface CombinedResult {
  results: AICrawlResult[];
  summary?: {
    totalIssues: number;
    totalUrls: number;
  };
  [key: string]: unknown;
}

export class AIService {
  async processAccessibilityIssues(
    issues: AccessibilityIssue[],
    options: AIProcessingOptions = {}
  ): Promise<AIProcessingResult> {
    const { apiKey, includeExplanations = true, includeRemediation = true, techStack } = options;

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
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async generateExplanation(
    openaiService: { generateResponse: (messages: OpenAIMessage[]) => Promise<{ content: string }> },
    issue: AccessibilityIssue,
    techStack?: string
  ): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an accessibility expert. Explain accessibility issues in plain language that developers can understand. Focus on why the issue matters and its impact on users.`,
      },
      {
        role: 'user',
        content: `Explain this accessibility issue in plain language:

Issue: ${issue.description}
Impact: ${issue.impact}
Help: ${issue.help}

${techStack ? `Tech Stack: ${techStack}` : ''}

Please provide a clear, concise explanation that helps developers understand why this issue is important and how it affects users.`,
      },
    ];

    const response = await openaiService.generateResponse(messages);
    return response.content;
  }

  private async generateRemediation(
    openaiService: { generateResponse: (messages: OpenAIMessage[]) => Promise<{ content: string }> },
    issue: AccessibilityIssue,
    techStack?: string
  ): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an accessibility expert and developer. Provide specific, actionable remediation steps for accessibility issues. Include code examples when appropriate.`,
      },
      {
        role: 'user',
        content: `Provide remediation steps for this accessibility issue:

Issue: ${issue.description}
Impact: ${issue.impact}
Help: ${issue.help}
Help URL: ${issue.helpUrl}

${techStack ? `Tech Stack: ${techStack}` : ''}

Please provide specific, actionable steps to fix this issue. Include code examples if relevant for the tech stack.`,
      },
    ];

    const response = await openaiService.generateResponse(messages);
    return response.content;
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

    const aiResult = await this.processAccessibilityIssues(crawlResults.issues, options);

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
          const aiResult = await this.processAccessibilityIssues(result.issues, options);
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
