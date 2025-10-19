import { createOpenAIService, isAIEnabled } from '../utils/openai';
import { OpenAIMessage } from '../services/openai';

export interface AIProcessingRequest {
  apiKey: string;
  messages: OpenAIMessage[];
}

export interface AIProcessingResponse {
  enabled: boolean;
  content?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

async function processWithAI(
  request: AIProcessingRequest
): Promise<AIProcessingResponse> {
  const { apiKey, messages } = request;

  if (!isAIEnabled(apiKey)) {
    return {
      enabled: false,
    };
  }

  try {
    const openaiService = createOpenAIService(apiKey);

    if (!openaiService) {
      return {
        enabled: false,
        error: 'Failed to initialize OpenAI service',
      };
    }

    const response = await openaiService.generateResponse(messages);

    return {
      enabled: true,
      content: response.content,
      usage: response.usage,
    };
  } catch (error) {
    return {
      enabled: true,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export { processWithAI };
