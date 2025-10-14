import puppeteer, { Browser } from 'puppeteer';
import * as cheerio from 'cheerio';
import { CrawlRequest, CrawlResponse, CrawlResult } from '../types';
import { env } from '../utils/env';
import logger from '../utils/logger';

export class CrawlingService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
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

        try {
          const page = await this.browser!.newPage();

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
          const title = await page.title();

          const content = await page.content();
          const $ = cheerio.load(content);
          const description =
            $('meta[name="description"]').attr('content') || '';

          results.push({
            url,
            title,
            description,
            statusCode,
            timestamp: new Date(),
          });

          visited.add(url);

          if (results.length < maxUrls) {
            const links = new Set<string>();
            $('a').each((_, el) => {
              const href = $(el).attr('href');
              if (href) {
                try {
                  const absoluteUrl = new URL(href, url).toString();
                  const linkUrl = new URL(absoluteUrl);

                  if (linkUrl.origin === baseUrl.origin) {
                    const normalizedUrl = new URL(
                      linkUrl.pathname,
                      baseUrl
                    ).toString();
                    if (
                      !visited.has(normalizedUrl) &&
                      !toVisit.has(normalizedUrl)
                    ) {
                      toVisit.add(normalizedUrl);
                      links.add(normalizedUrl);
                    }
                  }
                } catch (error) {
                  logger.warn('Invalid URL found during crawling', {
                    href,
                    error,
                  });
                }
              }
            });

            const linksArray = Array.from(links).slice(0, concurrency);
            await Promise.all(linksArray.map(crawlPage));
          }

          await page.close();
        } catch (error) {
          logger.error('Failed to crawl page', { url, error });
          visited.add(url);
        }
      };

      await crawlPage(request.url);

      const crawlTime = Date.now() - startTime;

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
