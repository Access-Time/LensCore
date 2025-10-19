import OpenAI from 'openai';
import logger from '../utils/logger';
import { OpenAIConfig, defaultOpenAIConfig } from '../config/openai';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIOptions {
  apiKey: string;
  config?: Partial<OpenAIConfig>;
}

export interface OpenAIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class OpenAIService {
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor(options: OpenAIOptions) {
    this.config = { ...defaultOpenAIConfig, ...options.config };
    
    this.client = new OpenAI({
      apiKey: options.apiKey,
      timeout: this.config.timeout,
    });
  }

  async generateResponse(
    messages: OpenAIMessage[],
    options?: Partial<OpenAIConfig>
  ): Promise<OpenAIResponse> {
    const config = { ...this.config, ...options };
    
    for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
      try {
        logger.info(`OpenAI request attempt ${attempt}/${config.retryAttempts}`, {
          model: config.model,
          messageCount: messages.length,
        });

        const response = await this.client.chat.completions.create({
          model: config.model,
          messages,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No content received from OpenAI');
        }

        logger.info('OpenAI request successful', {
          model: config.model,
          usage: response.usage,
        });

        return {
          content,
          usage: response.usage ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          } : undefined,
        };
      } catch (error) {
        const isLastAttempt = attempt === config.retryAttempts;
        
        if (this.isRetryableError(error) && !isLastAttempt) {
          const delay = config.retryDelay * Math.pow(2, attempt - 1);
          logger.warn(`OpenAI request failed, retrying in ${delay}ms`, {
            attempt,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          
          await this.sleep(delay);
          continue;
        }

        logger.error('OpenAI request failed', {
          attempt,
          error: error instanceof Error ? error.message : 'Unknown error',
          isRetryable: this.isRetryableError(error),
        });

        throw this.handleError(error);
      }
    }

    throw new Error('Maximum retry attempts exceeded');
  }

  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    const retryableErrors = [
      'rate_limit_exceeded',
      'server_error',
      'timeout',
      'network',
      'ECONNRESET',
      'ETIMEDOUT',
    ];

    return retryableErrors.some(retryableError => 
      error.message.toLowerCase().includes(retryableError)
    );
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      if (error.message.includes('rate_limit_exceeded')) {
        return new Error('OpenAI rate limit exceeded. Please try again later.');
      }
      
      if (error.message.includes('invalid_api_key')) {
        return new Error('Invalid OpenAI API key provided.');
      }
      
      if (error.message.includes('insufficient_quota')) {
        return new Error('OpenAI API quota exceeded.');
      }
      
      if (error.message.includes('timeout')) {
        return new Error('OpenAI request timed out.');
      }
      
      return new Error(`OpenAI API error: ${error.message}`);
    }
    
    return new Error('Unknown OpenAI API error');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isEnabled(): boolean {
    return !!this.client;
  }
}
