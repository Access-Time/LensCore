import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3001'),

  // Storage Configuration
  STORAGE_TYPE: z.enum(['local', 's3', 'gcs']).default('local'),
  STORAGE_PATH: z.string().default('./storage'),

  // AWS S3 Configuration
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),

  // Google Cloud Storage Configuration
  GCS_PROJECT_ID: z.string().optional(),
  GCS_KEY_FILE_PATH: z.string().optional(),
  GCS_BUCKET_NAME: z.string().optional(),

  // Crawling Configuration
  CRAWL_TIMEOUT: z.string().default('10000'),
  CRAWL_CONCURRENCY: z.string().default('5'),
  CRAWL_MAX_URLS: z.string().default('25'),
  CRAWL_WAIT_UNTIL: z.string().default('domcontentloaded'),

  // Accessibility Testing Configuration
  AXE_TIMEOUT: z.string().default('10000'),
  AXE_CONCURRENCY: z.string().default('5'),

  // API Configuration
  API_RATE_LIMIT: z.string().default('100'),
  API_TIMEOUT: z.string().default('30000'),

  // Logging Configuration
  LOG_LEVEL: z.string().default('info'),
  LOG_FILE: z.string().default('./logs/lenscore.log'),

  // Health Check Configuration
  HEALTH_CHECK_INTERVAL: z.string().default('30000'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
