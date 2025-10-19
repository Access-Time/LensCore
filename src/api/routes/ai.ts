import { Router } from 'express';
import { z } from 'zod';
import { processWithAI } from '../ai';
import logger from '../../utils/logger';

const router = Router();

const aiRequestSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1, 'Message content is required'),
  })).min(1, 'At least one message is required'),
});

router.post('/process', async (req, res) => {
  try {
    const validatedData = aiRequestSchema.parse(req.body);
    
    logger.info('AI processing request received', {
      messageCount: validatedData.messages.length,
      hasApiKey: !!validatedData.apiKey,
    });

    const result = await processWithAI(validatedData);

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
});

router.get('/status', (_req, res) => {
  res.json({
    success: true,
    aiEnabled: false,
    message: 'AI processing is available when API key is provided',
  });
});

export default router;
