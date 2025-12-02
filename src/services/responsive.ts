import { chromium, Browser, LaunchOptions } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import {
  ResponsiveTestRequest,
  ResponsiveTestResult,
  ResponsiveScreenshot,
  ResponsiveViewport,
  ResponsiveIssue,
} from '../types/responsive';
import { createStorageService } from '../storage';
import logger from '../utils/logger';
import { CacheService } from './cache';
import { createCacheConfig } from '../config/cache';
import crypto from 'crypto';
import { createOpenAIService } from '../utils/openai';
import {
  ResponsivePromptEngine,
  ResponsiveAIResponse,
} from '../utils/responsive-prompts';
import { env } from '../utils/env';

const VIEWPORTS: ResponsiveViewport[] = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

export class ResponsiveService {
  private browser: Browser | null = null;
  private storageService = createStorageService();
  private cacheService: CacheService;

  constructor() {
    this.cacheService = CacheService.getInstance(createCacheConfig());
  }

  async initialize(): Promise<void> {
    const executablePath = process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'];

    const launchOptions: LaunchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }

    this.browser = await chromium.launch(launchOptions);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private generateCacheKey(request: ResponsiveTestRequest): string {
    const keyData = {
      url: request.url,
      timeout: request.timeout || 30000,
      type: 'responsive',
    };

    return `responsive:${crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex')}`;
  }

  async testResponsive(
    request: ResponsiveTestRequest
  ): Promise<ResponsiveTestResult> {
    const cacheKey = this.generateCacheKey(request);
    const skipCache = request.skipCache === true;

    if (!skipCache) {
      try {
        const cachedResult = await this.cacheService.get({
          ruleId: cacheKey,
          projectContext: {},
        });

        if (cachedResult) {
          logger.info('Cache hit for responsive test result', {
            url: request.url,
          });
          return cachedResult.value as ResponsiveTestResult;
        }

        logger.info('Cache miss for responsive test result', {
          url: request.url,
        });
      } catch (error) {
        logger.warn('Cache error during responsive test', { error });
      }
    } else {
      logger.info('Cache skipped for responsive test result', {
        url: request.url,
      });
    }

    if (!request.aiApiKey) {
      return {
        url: request.url,
        passed: false,
        issues: [
          {
            type: 'other',
            severity: 'critical',
            viewport: 'desktop',
            description:
              'AI API key is required for responsive testing. Please provide AI_API_KEY environment variable or aiApiKey parameter.',
          },
        ],
        screenshots: [],
        timestamp: new Date(),
        metadata: {
          aiEnabled: false,
          aiError: 'AI API key is required',
        },
      };
    }

    const timeout = request.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      if (!this.browser) {
        await this.initialize();
      }

      const page = await this.browser!.newPage();
      page.setDefaultTimeout(Math.min(timeout, 15000));

      try {
        if (controller.signal.aborted) {
          throw new Error('Operation aborted');
        }

        await page.goto(request.url, {
          waitUntil: 'domcontentloaded',
          timeout: Math.min(timeout, 15000),
        });

        if (controller.signal.aborted) {
          throw new Error('Operation aborted');
        }

        const screenshots: ResponsiveScreenshot[] = [];

        for (const viewport of VIEWPORTS) {
          try {
            await page.setViewportSize({
              width: viewport.width,
              height: viewport.height,
            });

            await page.waitForTimeout(500);

            await page.evaluate(async () => {
              const scrollHeight = document.documentElement.scrollHeight;
              const viewportHeight = window.innerHeight;

              if (scrollHeight > viewportHeight) {
                const scrollSteps = Math.max(
                  3,
                  Math.ceil(scrollHeight / viewportHeight)
                );
                const stepDelay = 300;
                const finalDelay = 500;

                for (let i = 0; i <= scrollSteps; i++) {
                  const progress = i / scrollSteps;
                  const targetScroll = Math.floor(scrollHeight * progress);
                  window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth',
                  });
                  await new Promise((resolve) =>
                    setTimeout(resolve, stepDelay)
                  );
                }

                window.scrollTo({
                  top: scrollHeight,
                  behavior: 'smooth',
                });
                await new Promise((resolve) => setTimeout(resolve, finalDelay));

                for (let i = scrollSteps; i >= 0; i--) {
                  const progress = i / scrollSteps;
                  const targetScroll = Math.floor(scrollHeight * progress);
                  window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth',
                  });
                  await new Promise((resolve) =>
                    setTimeout(resolve, stepDelay)
                  );
                }

                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
                await new Promise((resolve) => setTimeout(resolve, finalDelay));
              } else {
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            });

            await page.waitForTimeout(500);

            const screenshot = await page.screenshot({ fullPage: true });
            const screenshotKey = `screenshots/responsive/${uuidv4()}-${viewport.name}.png`;
            const tempPath = `/tmp/${uuidv4()}-${viewport.name}.png`;

            await fs.writeFile(tempPath, screenshot);
            const screenshotUrl = await this.storageService.uploadFile(
              tempPath,
              screenshotKey
            );

            const screenshotBase64 = screenshot.toString('base64');

            screenshots.push({
              viewport,
              screenshotUrl,
              screenshotBase64,
            });

            await fs.unlink(tempPath).catch(() => {});

            logger.info('Screenshot captured', {
              viewport: viewport.name,
              url: request.url,
            });
          } catch (error) {
            logger.error('Screenshot capture failed', {
              viewport: viewport.name,
              error: error instanceof Error ? error.message : String(error),
              url: request.url,
            });
          }
        }

        if (screenshots.length === 0) {
          throw new Error('Failed to capture any screenshots');
        }

        const aiResult = await this.evaluateWithAI(
          screenshots,
          request.aiApiKey!
        );

        const result: ResponsiveTestResult = {
          url: request.url,
          passed: aiResult.passed,
          issues: aiResult.issues,
          screenshots,
          timestamp: new Date(),
          metadata: {
            aiEnabled: true,
            aiError: aiResult.error,
            processingTime: aiResult.processingTime,
          },
        };

        try {
          await this.cacheService.set(
            {
              ruleId: cacheKey,
              projectContext: {},
            },
            result
          );
          logger.info('Cached responsive test result', { url: request.url });
        } catch (error) {
          logger.warn('Failed to cache responsive test result', { error });
        }

        return result;
      } finally {
        await page.close();
        clearTimeout(timeoutId);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      logger.error('Responsive test error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: request.url,
      });

      return {
        url: request.url,
        passed: false,
        issues: [
          {
            type: 'other',
            severity: 'critical',
            viewport: 'desktop',
            description: `Responsive test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        screenshots: [],
        timestamp: new Date(),
        metadata: {
          aiEnabled: false,
          aiError: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private async evaluateWithAI(
    screenshots: ResponsiveScreenshot[],
    aiApiKey: string
  ): Promise<{
    passed: boolean;
    issues: ResponsiveIssue[];
    error?: string;
    processingTime?: number;
  }> {
    const startTime = Date.now();

    try {
      const openaiService = createOpenAIService(aiApiKey);

      if (!openaiService) {
        throw new Error('Failed to initialize OpenAI service');
      }

      const messages = ResponsivePromptEngine.generatePrompt(screenshots);

      const visionModels = [
        'gpt-4o',
        'gpt-4-turbo',
        'gpt-4-vision-preview',
        'gpt-4o-mini',
      ];
      const requestedModel = env.OPENAI_MODEL || 'gpt-3.5-turbo';
      const model = visionModels.includes(requestedModel)
        ? requestedModel
        : 'gpt-4o';

      if (requestedModel !== model) {
        logger.info('Using vision-capable model for responsive test', {
          requested: requestedModel,
          using: model,
        });
      }

      const response =
        await openaiService.generateStructuredResponse<ResponsiveAIResponse>(
          messages,
          {
            name: 'responsive_test_result',
            schema: ResponsivePromptEngine.getResponseSchema(),
            strict: true,
          },
          {
            model,
            maxTokens: 2000,
            temperature: 0.3,
          }
        );

      const parsed = ResponsivePromptEngine.parseStructuredResponse(
        response.content
      );

      return {
        passed: parsed.passed,
        issues: parsed.issues,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error('AI evaluation failed for responsive test', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      const fallback = ResponsivePromptEngine.createFallbackResponse();

      return {
        passed: fallback.passed,
        issues: fallback.issues,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      };
    }
  }
}
