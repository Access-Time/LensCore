/* eslint-disable @typescript-eslint/no-explicit-any */
import ora from 'ora';

export class LensCoreClient {
  private baseUrl = 'http://localhost:3001';

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
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

  async scan(options: any): Promise<any> {
    const spinner = ora('Running accessibility scan...').start();

    try {
      const response = await fetch(`${this.baseUrl}/api/combined`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: options.url,
          enableAI: options.enableAI,
          projectContext: options.projectContext,
          crawlOptions: {
            maxUrls: 10,
            concurrency: 3,
            timeout: 15000,
          },
          testOptions: {
            includeScreenshot: true,
            timeout: 15000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      spinner.succeed('Scan completed');

      return result;
    } catch (error: any) {
      spinner.fail('Scan failed');
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
