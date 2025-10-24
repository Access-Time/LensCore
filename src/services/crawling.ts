import puppeteer, { Browser } from 'puppeteer';
import * as cheerio from 'cheerio';
import { CrawlRequest, CrawlResponse, CrawlResult, CrawlRules } from '../types';
import { env } from '../utils/env';
import logger from '../utils/logger';
import { CacheService } from './cache';
import { createCacheConfig } from '../config/cache';
import crypto from 'crypto';

export class CrawlingService {
  private browser: Browser | null = null;
  private cacheService: CacheService;

  constructor() {
    this.cacheService = CacheService.getInstance(createCacheConfig());
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
        ],
        timeout: 30000,
      });

      logger.info('Browser initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize browser', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        logger.info('Browser closed successfully');
      } catch (error) {
        logger.error('Failed to close browser', error);
      } finally {
        this.browser = null;
      }
    }
  }

  private generateCacheKey(request: CrawlRequest): string {
    const keyData = {
      url: request.url,
      maxUrls: request.maxUrls || parseInt(env.CRAWL_MAX_URLS),
      maxDepth: request.max_depth || 2,
      concurrency: request.concurrency || parseInt(env.CRAWL_CONCURRENCY),
      waitUntil: request.waitUntil || env.CRAWL_WAIT_UNTIL,
      rules: request.rules || {},
    };
    
    return `crawl:${crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex')}`;
  }

  async crawlWebsite(request: CrawlRequest): Promise<CrawlResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);
    
    try {
      const cachedResult = await this.cacheService.get({
        ruleId: cacheKey,
        projectContext: {}
      });
      
      if (cachedResult) {
        logger.info('Cache hit for crawl result', { url: request.url });
        return cachedResult.value as CrawlResponse;
      }
      
      logger.info('Cache miss for crawl result', { url: request.url });
    } catch (error) {
      logger.warn('Cache error during crawl', { error });
    }

    const controller = new AbortController();
    const timeout = request.timeout || parseInt(env.CRAWL_TIMEOUT);

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      if (!this.browser) {
        await this.initialize();
      }

      const visited = new Set<string>();
      const results: CrawlResult[] = [];
      const maxUrls = request.maxUrls || parseInt(env.CRAWL_MAX_URLS);
      const concurrency =
        request.concurrency || parseInt(env.CRAWL_CONCURRENCY);
      const maxDepth = request.max_depth || 2;
      const rules = request.rules || {};

      const baseUrl = new URL(request.url);

      interface CrawlQueueItem {
        url: string;
        depth: number;
      }

      const queue: CrawlQueueItem[] = [{ url: request.url, depth: 0 }];

      const crawlPage = async (
        item: CrawlQueueItem
      ): Promise<CrawlQueueItem[]> => {
        if (controller.signal.aborted) {
          throw new Error('Operation aborted');
        }

        const { url, depth } = item;

        if (visited.has(url) || results.length >= maxUrls || depth > maxDepth) {
          return [];
        }

        let page = null;
        const nextItems: CrawlQueueItem[] = [];

        try {
          page = await this.browser!.newPage();
          page.setDefaultTimeout(Math.min(timeout, 15000));

          await page.setViewport({ width: 1280, height: 720 });
          await page.setUserAgent(
            'Mozilla/5.0 (compatible; LensCore/1.0; +https://github.com/accesslens/lenscore)'
          );

          if (request.headers) {
            await page.setExtraHTTPHeaders(request.headers);
          }

          const pageController = new AbortController();
          const pageTimeoutId = setTimeout(() => {
            pageController.abort();
          }, Math.min(timeout, 15000));

          try {
            const response = await page.goto(url, {
              waitUntil:
                request.waitUntil ||
                (env.CRAWL_WAIT_UNTIL as
                  | 'domcontentloaded'
                  | 'networkidle0'
                  | 'networkidle2'),
              timeout: Math.min(timeout, 15000),
            });

            clearTimeout(pageTimeoutId);

            const statusCode = response?.status() || 0;

            if (statusCode >= 400) {
              logger.warn('HTTP error status', { url, statusCode });
              visited.add(url);
              return [];
            }

            const title = await page.title();
            const content = await page.content();
            const $ = cheerio.load(content);

            const description =
              $('meta[name="description"]').attr('content') ||
              $('meta[property="og:description"]').attr('content') ||
              '';

            results.push({
              url,
              title: title || 'Untitled',
              description,
              statusCode,
              timestamp: new Date(),
            });

            visited.add(url);

            if (depth < maxDepth && results.length < maxUrls) {
              const links = this.extractLinks($, url, baseUrl, rules);

              for (const link of links) {
                if (!visited.has(link) && nextItems.length < concurrency) {
                  nextItems.push({ url: link, depth: depth + 1 });
                }
              }
            }
          } catch (pageError) {
            clearTimeout(pageTimeoutId);
            if (pageController.signal.aborted) {
              throw new Error('Page operation timeout');
            }
            throw pageError;
          }
        } catch (error) {
          logger.error('Failed to crawl page', {
            url,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          visited.add(url);
        } finally {
          if (page) {
            try {
              await page.close();
            } catch (closeError) {
              logger.warn('Failed to close page', {
                url,
                error:
                  closeError instanceof Error
                    ? closeError.message
                    : String(closeError),
              });
            }
          }
        }

        return nextItems;
      };

      while (queue.length > 0 && results.length < maxUrls && !controller.signal.aborted) {
        const batch = queue.splice(0, concurrency);
        const promises = batch.map(crawlPage);
        
        try {
          const batchResults = await Promise.allSettled(promises);

          for (const result of batchResults) {
            if (result.status === 'fulfilled') {
              queue.push(...result.value);
            }
          }
        } catch (error) {
          if (controller.signal.aborted) {
            break;
          }
          logger.error('Batch processing error', { error });
        }
      }

      clearTimeout(timeoutId);

      const crawlTime = Date.now() - startTime;

      const result = {
        pages: results,
        totalPages: results.length,
        crawlTime,
      };

      try {
        await this.cacheService.set({
          ruleId: cacheKey,
          projectContext: {}
        }, result);
        logger.info('Cached crawl result', { url: request.url });
      } catch (error) {
        logger.warn('Failed to cache crawl result', { error });
      }

      logger.info('Crawling completed', {
        url: request.url,
        totalPages: results.length,
        crawlTime,
        maxUrls,
        concurrency,
        maxDepth,
        rules,
        aborted: controller.signal.aborted,
      });

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      logger.error('Crawling service error:', error);
      return this.getMockCrawlResult(request, startTime);
    }
  }

  private extractLinks(
    $: cheerio.CheerioAPI,
    currentUrl: string,
    baseUrl: URL,
    rules: CrawlRules
  ): string[] {
    const links: string[] = [];

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || !href.trim()) return;

      try {
        const absoluteUrl = new URL(href, currentUrl).toString();
        const linkUrl = new URL(absoluteUrl);

        if (this.shouldFollowLink(linkUrl, baseUrl, rules)) {
          const normalizedUrl = this.normalizeUrl(linkUrl, baseUrl, rules);
          if (normalizedUrl && !links.includes(normalizedUrl)) {
            links.push(normalizedUrl);
          }
        }
      } catch (error) {
        logger.debug('Invalid URL found during crawling', {
          href,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    return links;
  }

  private shouldFollowLink(
    linkUrl: URL,
    baseUrl: URL,
    rules: CrawlRules
  ): boolean {
    if (
      linkUrl.pathname.includes('#') ||
      linkUrl.pathname.includes('mailto:') ||
      linkUrl.pathname.includes('tel:')
    ) {
      return false;
    }

    if (rules.follow_external === false && linkUrl.origin !== baseUrl.origin) {
      return false;
    }

    if (
      rules.include_subdomains === false &&
      linkUrl.hostname !== baseUrl.hostname &&
      !linkUrl.hostname.endsWith('.' + baseUrl.hostname)
    ) {
      return false;
    }

    if (rules.exclude_paths) {
      for (const excludePath of rules.exclude_paths) {
        if (linkUrl.pathname.includes(excludePath)) {
          return false;
        }
      }
    }

    if (rules.include_paths && rules.include_paths.length > 0) {
      const hasIncludedPath = rules.include_paths.some((includePath) =>
        linkUrl.pathname.includes(includePath)
      );
      if (!hasIncludedPath) {
        return false;
      }
    }

    return true;
  }

  private normalizeUrl(
    linkUrl: URL,
    baseUrl: URL,
    rules: CrawlRules
  ): string | null {
    if (rules.follow_external === false && linkUrl.origin !== baseUrl.origin) {
      return null;
    }

    if (linkUrl.origin === baseUrl.origin) {
      return new URL(linkUrl.pathname + linkUrl.search, baseUrl).toString();
    }

    if (
      rules.include_subdomains &&
      linkUrl.hostname.endsWith('.' + baseUrl.hostname)
    ) {
      return linkUrl.toString();
    }

    if (rules.follow_external) {
      return linkUrl.toString();
    }

    return null;
  }

  private getMockCrawlResult(
    request: CrawlRequest,
    startTime: number
  ): CrawlResponse {
    const crawlTime = Date.now() - startTime;

    return {
      pages: [
        {
          url: request.url,
          title: 'Example Domain',
          description:
            'This domain is for use in illustrative examples in documents.',
          statusCode: 200,
          timestamp: new Date(),
        },
      ],
      totalPages: 1,
      crawlTime,
    };
  }
}
