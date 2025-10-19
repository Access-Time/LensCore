import { z } from 'zod';

export const crawlRequestSchema = z.object({
  url: z.string().url(),
  maxUrls: z.number().min(1).max(100).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  concurrency: z.number().min(1).max(10).optional(),
  waitUntil: z
    .enum(['domcontentloaded', 'networkidle0', 'networkidle2'])
    .optional(),
  headers: z.record(z.string()).optional(),
});

export const accessibilityRequestSchema = z.object({
  url: z.string().url(),
  timeout: z.number().min(1000).max(60000).optional(),
  includeScreenshot: z.boolean().optional(),
  rules: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const combinedRequestSchema = z.object({
  url: z.string().url(),
  crawlOptions: crawlRequestSchema.partial().optional(),
  testOptions: accessibilityRequestSchema.partial().optional(),
});
