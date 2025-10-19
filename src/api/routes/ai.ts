import { Request, Response } from 'express';
import { z } from 'zod';
import { processWithAI } from '../ai';
import logger from '../../utils/logger';
import { env } from '../../utils/env';

const aiRequestSchema = z.object({
  apiKey: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string().min(1, 'Message content is required'),
      })
    )
    .min(1, 'At least one message is required'),
});

export const aiProcessHandler = async (req: Request, res: Response) => {
  try {
    const validatedData = aiRequestSchema.parse(req.body);
    const { env } = await import('../../utils/env');

    // Use API key from request or fallback to environment
    const apiKey = validatedData.apiKey || env.OPENAI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({
        success: false,
        error:
          'API key is required either in request body or environment variables',
      });
    }

    logger.info('AI processing request received', {
      messageCount: validatedData.messages.length,
      hasApiKey: !!apiKey,
      apiKeySource: validatedData.apiKey ? 'request' : 'environment',
    });

    const result = await processWithAI({
      apiKey,
      messages: validatedData.messages,
    });

    if (!result.enabled) {
      return res.status(200).json({
        success: true,
        enabled: false,
        message: 'AI processing is disabled - no API key provided',
      });
    }

    if (result.error) {
      return res.status(400).json({
        success: false,
        enabled: true,
        error: result.error,
      });
    }

    return res.json({
      success: true,
      enabled: true,
      content: result.content,
      usage: result.usage,
    });
  } catch (error) {
    logger.error('AI processing request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const aiStatusHandler = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    aiEnabled: !!(env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim() !== ''),
    message: env.OPENAI_API_KEY
      ? 'AI processing is enabled'
      : 'AI processing is available when API key is provided',
  });
};
