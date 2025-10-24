/* eslint-disable @typescript-eslint/no-explicit-any */
import ora from 'ora';

export class LensCoreClient {
  private baseUrl = 'http://localhost:3001';

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/api/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async waitForReady(timeout = 30000): Promise<void> {
    const spinner = ora('Waiting for LensCore to be ready...').start();
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.checkHealth()) {
        spinner.succeed('LensCore is ready');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    spinner.fail('LensCore failed to start within timeout');
    throw new Error('LensCore startup timeout');
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    timeout = 30000
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async crawl(options: any): Promise<any> {
    const spinner = ora('Crawling website...').start();

    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/api/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: options.url,
          max_depth: options.maxDepth || 2,
          maxUrls: options.maxUrls || 10,
          timeout: options.timeout || 10000,
          concurrency: options.concurrency || 3,
          waitUntil: options.waitUntil || 'domcontentloaded',
          rules: options.rules || {},
          enableAI: options.enableAI,
          aiApiKey: options.openaiKey,
          projectContext: options.projectContext,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      spinner.succeed('Crawl completed');

      return result;
    } catch (error: any) {
      spinner.fail('Crawl failed');
      throw error;
    }
  }

  async test(options: any): Promise<any> {
    const spinner = ora('Testing accessibility...').start();
    const timeout = Math.max(options.timeout || 10000, 30000);

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: options.url,
            includeScreenshot: options.includeScreenshot !== false,
            timeout: timeout,
            rules: options.rules || [],
            tags: options.tags || [],
            enableAI: options.enableAI,
            aiApiKey: options.openaiKey,
            projectContext: options.projectContext,
          }),
        },
        3,
        timeout
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      spinner.succeed('Test completed');

      return result;
    } catch (error: any) {
      spinner.fail('Test failed');
      throw error;
    }
  }

  async scan(options: any): Promise<any> {
    const spinner = ora('Running accessibility scan...').start();

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/combined`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: options.url,
            enableAI: options.enableAI,
            aiApiKey: options.openaiKey,
            projectContext: options.projectContext,
            crawlOptions: {
              maxUrls: options.maxUrls || 10,
              concurrency: options.concurrency || 3,
              timeout: options.timeout || 15000,
              max_depth: options.maxDepth || 2,
            },
            testOptions: {
              includeScreenshot: true,
              timeout: options.timeout || 15000,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      spinner.succeed('Scan completed');

      return result;
    } catch (error: any) {
      spinner.fail('Scan failed');
      throw error;
    }
  }

  async testMultiple(options: any): Promise<any> {
    const spinner = ora('Testing multiple pages...').start();

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/test-multiple`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            options.urls.map((url: string) => ({
              url,
              includeScreenshot: options.includeScreenshot !== false,
              timeout: options.timeout || 10000,
              rules: options.rules || [],
              tags: options.tags || [],
              enableAI: options.enableAI,
              aiApiKey: options.openaiKey,
              projectContext: options.projectContext,
            }))
          ),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      spinner.succeed('Multiple test completed');

      return result;
    } catch (error: any) {
      spinner.fail('Multiple test failed');
      throw error;
    }
  }

  async getResults(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/results`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
