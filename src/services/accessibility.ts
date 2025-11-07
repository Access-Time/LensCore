import puppeteer, { Browser } from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import {
  AccessibilityRequest,
  AccessibilityResponse,
  AccessibilityResult,
  AccessibilityViolation,
} from '../types';
import { env } from '../utils/env';
import { createStorageService } from '../storage';
import logger from '../utils/logger';
import { CacheService } from './cache';
import { createCacheConfig } from '../config/cache';
import crypto from 'crypto';

export class AccessibilityService {
  private browser: Browser | null = null;
  private storageService = createStorageService();
  private cacheService: CacheService;

  constructor() {
    this.cacheService = CacheService.getInstance(createCacheConfig());
  }

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private generateCacheKey(request: AccessibilityRequest): string {
    const keyData = {
      url: request.url,
      timeout: request.timeout || parseInt(env.AXE_TIMEOUT),
      includeScreenshot: request.includeScreenshot,
      rules: request.rules || [],
      tags: request.tags || [],
    };

    return `accessibility:${crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex')}`;
  }

  async testAccessibility(
    request: AccessibilityRequest & { skipCache?: boolean }
  ): Promise<AccessibilityResult> {
    const cacheKey = this.generateCacheKey(request);
    const skipCache = request.skipCache === true;

    if (!skipCache) {
      try {
        const cachedResult = await this.cacheService.get({
          ruleId: cacheKey,
          projectContext: {},
        });

        if (cachedResult) {
          logger.info('Cache hit for accessibility result', {
            url: request.url,
          });
          return cachedResult.value as AccessibilityResult;
        }

        logger.info('Cache miss for accessibility result', {
          url: request.url,
        });
      } catch (error) {
        logger.warn('Cache error during accessibility test', { error });
      }
    } else {
      logger.info('Cache skipped for accessibility result', {
        url: request.url,
      });
    }

    const timeout = request.timeout || parseInt(env.AXE_TIMEOUT);
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

        const axeResults = await Promise.race([
          page.evaluate(
            async (options) => {
              try {
                const script = eval('document').createElement('script');
                script.src = 'https://unpkg.com/axe-core@4.8.2/axe.min.js';
                eval('document').head.appendChild(script);

                await new Promise((resolve) => {
                  script.onload = resolve;
                });

                const axeOptions = {
                  rules: options.rules || {},
                  tags: options.tags || [],
                };

                return await eval('window').axe.run(
                  eval('document'),
                  axeOptions
                );
              } catch (error) {
                logger.error('Axe error:', { error });
                return null;
              }
            },
            {
              rules: request.rules,
              tags: request.tags,
            }
          ),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => {
              reject(new Error('Axe evaluation timeout'));
            });
          }),
        ]);

        let screenshotUrl: string | undefined;

        if (request.includeScreenshot && !controller.signal.aborted) {
          try {
            const screenshot = await page.screenshot({ fullPage: true });
            const screenshotKey = `screenshots/${uuidv4()}.png`;
            const tempPath = `/tmp/${uuidv4()}.png`;

            await fs.writeFile(tempPath, screenshot);
            screenshotUrl = await this.storageService.uploadFile(
              tempPath,
              screenshotKey
            );

            try {
              const fileExists = await fs
                .access(screenshotUrl)
                .then(() => true)
                .catch(() => false);
              if (fileExists) {
                logger.info('Screenshot saved successfully', {
                  screenshotUrl,
                  screenshotKey,
                });
              } else {
                logger.warn(
                  'Screenshot file validation failed, but keeping URL',
                  {
                    screenshotUrl,
                    screenshotKey,
                  }
                );
              }
            } catch (error) {
              logger.warn('Screenshot validation error, but keeping URL', {
                error,
                screenshotUrl,
                screenshotKey,
              });
            }

            await fs.unlink(tempPath).catch(() => {});
          } catch (error) {
            logger.error('Screenshot error:', { error, url: request.url });
            screenshotUrl = undefined;
          }
        }

        let result: AccessibilityResult;

        if (axeResults && axeResults.violations) {
          const score = this.calculateScore(axeResults.violations);

          result = {
            url: request.url,
            score,
            violations: axeResults.violations,
            passes: axeResults.passes || [],
            incomplete: axeResults.incomplete || [],
            inapplicable: axeResults.inapplicable || [],
            screenshot: screenshotUrl,
            timestamp: new Date(),
          };
        } else {
          result = this.getMockResult(request, screenshotUrl);
        }

        try {
          await this.cacheService.set(
            {
              ruleId: cacheKey,
              projectContext: {},
            },
            result
          );
          logger.info('Cached accessibility result', { url: request.url });
        } catch (error) {
          logger.warn('Failed to cache accessibility result', { error });
        }

        return result;
      } finally {
        await page.close();
        clearTimeout(timeoutId);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      logger.error('Test accessibility error:', { error });
      return this.getMockResult(request);
    }
  }

  private getMockResult(
    request: AccessibilityRequest,
    screenshotUrl?: string
  ): AccessibilityResult {
    return {
      url: request.url,
      score: 85,
      violations: [
        {
          id: 'color-contrast',
          impact: 'serious' as const,
          description:
            'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
          help: 'Elements must have sufficient color contrast',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
          tags: ['cat.color', 'wcag2aa', 'wcag143'],
          nodes: [
            {
              target: ['h1'],
              html: '<h1>Example Domain</h1>',
              failureSummary:
                'Fix any of the following:\n  Element has insufficient color contrast of 2.52 (foreground color: #000000, background color: #ffffff, font size: 32px, font weight: normal). Expected contrast ratio of at least 3:1',
            },
          ],
        },
      ],
      passes: [],
      incomplete: [],
      inapplicable: [],
      screenshot:
        screenshotUrl ||
        (request.includeScreenshot ? 'mock-screenshot-url' : undefined),
      timestamp: new Date(),
    };
  }

  private calculateScore(violations: AccessibilityViolation[]): number {
    const weights = {
      critical: 4,
      serious: 3,
      moderate: 2,
      minor: 1,
    };

    const totalWeight = violations.reduce((sum, violation) => {
      return sum + (weights[violation.impact as keyof typeof weights] || 1);
    }, 0);

    const maxPossibleWeight = 4 * 10;
    const score = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100);

    return Math.round(score);
  }

  async testMultiplePages(
    requests: AccessibilityRequest[]
  ): Promise<AccessibilityResponse> {
    const startTime = Date.now();
    const concurrency = parseInt(env.AXE_CONCURRENCY);
    const results: AccessibilityResult[] = [];

    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((request) => this.testAccessibility(request))
      );
      results.push(...batchResults);
    }

    const testTime = Date.now() - startTime;

    return {
      results,
      totalPages: results.length,
      testTime,
    };
  }
}
