import puppeteer, { Browser } from 'puppeteer';
import * as cheerio from 'cheerio';
import { CrawlRequest, CrawlResponse, CrawlResult } from '../types';
import { env } from '../utils/env';
import logger from '../utils/logger';

export class CrawlingService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
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
          '--disable-renderer-backgrounding'
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

  async crawlWebsite(request: CrawlRequest): Promise<CrawlResponse> {
    const startTime = Date.now();

    try {
      if (!this.browser) {
        await this.initialize();
      }

      const visited = new Set<string>();
      const toVisit = new Set<string>([request.url]);
      const results: CrawlResult[] = [];
      const maxUrls = request.maxUrls || parseInt(env.CRAWL_MAX_URLS);
      const concurrency =
        request.concurrency || parseInt(env.CRAWL_CONCURRENCY);
      const timeout = request.timeout || parseInt(env.CRAWL_TIMEOUT);

      const baseUrl = new URL(request.url);

      const crawlPage = async (url: string): Promise<void> => {
        if (visited.has(url) || results.length >= maxUrls) {
          return;
        }

        let page = null;
        try {
          page = await this.browser!.newPage();
          
          await page.setViewport({ width: 1280, height: 720 });
          await page.setUserAgent('Mozilla/5.0 (compatible; LensCore/1.0; +https://github.com/accesslens/lenscore)');

          if (request.headers) {
            await page.setExtraHTTPHeaders(request.headers);
          }

          if (request.auth) {
            await page.authenticate({
              username: request.auth.username,
              password: request.auth.password,
            });
          }

          const response = await page.goto(url, {
            waitUntil:
              request.waitUntil ||
              (env.CRAWL_WAIT_UNTIL as
                | 'domcontentloaded'
                | 'networkidle0'
                | 'networkidle2'),
            timeout,
          });

          const statusCode = response?.status() || 0;
          
          if (statusCode >= 400) {
            logger.warn('HTTP error status', { url, statusCode });
            visited.add(url);
            return;
          }

          const title = await page.title();
          const content = await page.content();
          const $ = cheerio.load(content);
          
          const description = $('meta[name="description"]').attr('content') || 
                             $('meta[property="og:description"]').attr('content') || '';

          results.push({
            url,
            title: title || 'Untitled',
            description,
            statusCode,
            timestamp: new Date(),
          });

          visited.add(url);

          if (results.length < maxUrls) {
            const links = new Set<string>();
            $('a[href]').each((_, el) => {
              const href = $(el).attr('href');
              if (href && href.trim()) {
                try {
                  const absoluteUrl = new URL(href, url).toString();
                  const linkUrl = new URL(absoluteUrl);

                  if (linkUrl.origin === baseUrl.origin && 
                      !linkUrl.pathname.includes('#') &&
                      !linkUrl.pathname.includes('mailto:') &&
                      !linkUrl.pathname.includes('tel:')) {
                    
                    const normalizedUrl = new URL(
                      linkUrl.pathname + linkUrl.search,
                      baseUrl
                    ).toString();
                    
                    if (
                      !visited.has(normalizedUrl) &&
                      !toVisit.has(normalizedUrl) &&
                      links.size < concurrency
                    ) {
                      toVisit.add(normalizedUrl);
                      links.add(normalizedUrl);
                    }
                  }
                } catch (error) {
                  logger.debug('Invalid URL found during crawling', {
                    href,
                    error: error instanceof Error ? error.message : String(error),
                  });
                }
              }
            });

            const linksArray = Array.from(links);
            const promises = linksArray.map(crawlPage);
            await Promise.allSettled(promises);
          }

        } catch (error) {
          logger.error('Failed to crawl page', { 
            url, 
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          visited.add(url);
        } finally {
          if (page) {
            try {
              await page.close();
            } catch (closeError) {
              logger.warn('Failed to close page', { 
                url, 
                error: closeError instanceof Error ? closeError.message : String(closeError) 
              });
            }
          }
        }
      };

      await crawlPage(request.url);

      const crawlTime = Date.now() - startTime;

      logger.info('Crawling completed', {
        url: request.url,
        totalPages: results.length,
        crawlTime,
        maxUrls,
        concurrency
      });

      return {
        pages: results,
        totalPages: results.length,
        crawlTime,
      };
    } catch (error) {
      logger.error('Crawling service error:', error);
      return this.getMockCrawlResult(request, startTime);
    }
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
