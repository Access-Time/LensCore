import { z } from 'zod';

export const openaiConfigSchema = z.object({
  apiKey: z.string().optional(),
  model: z.string().default('gpt-3.5-turbo'),
  maxTokens: z.number().default(1000),
  temperature: z.number().min(0).max(2).default(0.7),
  timeout: z.number().default(30000),
  retryAttempts: z.number().min(1).max(5).default(3),
  retryDelay: z.number().min(100).default(1000),
});

export type OpenAIConfig = z.infer<typeof openaiConfigSchema>;

export const defaultOpenAIConfig: OpenAIConfig = {
  apiKey: undefined,
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.7,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};
