import { z } from 'zod';

const crawlRulesSchema = z.object({
  include_subdomains: z.boolean().optional(),
  follow_external: z.boolean().optional(),
  exclude_paths: z.array(z.string()).optional(),
  include_paths: z.array(z.string()).optional(),
  respect_robots: z.boolean().optional(),
});

export const crawlRequestSchema = z.object({
  url: z.string().url(),
  max_depth: z.number().min(1).max(5).optional(),
  maxUrls: z.number().min(1).max(100).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  concurrency: z.number().min(1).max(10).optional(),
  waitUntil: z
    .enum(['domcontentloaded', 'networkidle0', 'networkidle2'])
    .optional(),
  headers: z.record(z.string()).optional(),
  rules: crawlRulesSchema.optional(),
  skipCache: z.boolean().optional(),
});

export const accessibilityRequestSchema = z.object({
  url: z.string().url(),
  timeout: z.number().min(1000).max(60000).optional(),
  includeScreenshot: z.boolean().optional(),
  rules: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  skipCache: z.boolean().optional(),
});

export const combinedRequestSchema = z.object({
  url: z.string().url(),
  crawlOptions: crawlRequestSchema.partial().optional(),
  testOptions: accessibilityRequestSchema.partial().optional(),
});
