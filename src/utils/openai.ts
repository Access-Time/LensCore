import { env } from './env';
import { OpenAIService, OpenAIOptions } from '../services/openai';
import { OpenAIConfig } from '../config/openai';

export function createOpenAIService(apiKey: string): OpenAIService | null {
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const config: Partial<OpenAIConfig> = {
    model: env.OPENAI_MODEL,
    maxTokens: parseInt(env.OPENAI_MAX_TOKENS, 10),
    temperature: parseFloat(env.OPENAI_TEMPERATURE),
    timeout: parseInt(env.OPENAI_TIMEOUT, 10),
    retryAttempts: parseInt(env.OPENAI_RETRY_ATTEMPTS, 10),
    retryDelay: parseInt(env.OPENAI_RETRY_DELAY, 10),
  };

  const options: OpenAIOptions = {
    apiKey,
    config,
  };

  return new OpenAIService(options);
}

export function createOpenAIServiceFromEnv(): OpenAIService | null {
  const apiKey = env.OPENAI_API_KEY;
  return createOpenAIService(apiKey || '');
}

export function isAIEnabled(apiKey?: string): boolean {
  return !!(apiKey && apiKey.trim() !== '');
}

export function isAIEnabledFromEnv(): boolean {
  return isAIEnabled(env.OPENAI_API_KEY);
}
