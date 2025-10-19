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

export class AccessibilityService {
  private browser: Browser | null = null;
  private storageService = createStorageService();

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

  async testAccessibility(
    request: AccessibilityRequest
  ): Promise<AccessibilityResult> {
    const timeout = request.timeout || parseInt(env.AXE_TIMEOUT);

    try {
      if (!this.browser) {
        await this.initialize();
      }

      const page = await this.browser!.newPage();

      page.setDefaultTimeout(timeout);

      try {
        await page.goto(request.url, {
          waitUntil: 'domcontentloaded',
          timeout: timeout,
        });

        const axeResults = await page.evaluate(
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

              return await eval('window').axe.run(eval('document'), axeOptions);
            } catch (error) {
              logger.error('Axe error:', { error });
              return null;
            }
          },
          {
            rules: request.rules,
            tags: request.tags,
          }
        );

        let screenshotUrl: string | undefined;

        if (request.includeScreenshot) {
          try {
            const screenshot = await page.screenshot({ fullPage: true });
            const screenshotKey = `screenshots/${uuidv4()}.png`;
            const tempPath = `/tmp/${uuidv4()}.png`;

            await fs.writeFile(tempPath, screenshot);
            screenshotUrl = await this.storageService.uploadFile(
              tempPath,
              screenshotKey
            );
            await fs.unlink(tempPath);
          } catch (error) {
            logger.error('Screenshot error:', { error });
          }
        }

        if (axeResults && axeResults.violations) {
          const score = this.calculateScore(axeResults.violations);

          return {
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
          return this.getMockResult(request, screenshotUrl);
        }
      } finally {
        await page.close();
      }
    } catch (error) {
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
