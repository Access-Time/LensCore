/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { LensCoreClient } from '../services/lenscore-client';
import { DockerService } from '../services/docker';
import { WebReportService } from '../services/web-report';

export class CommandUtils {
  private static client: LensCoreClient | null = null;

  /**
   * Ensure LensCore is ready (auto-start if needed)
   */
  static async ensureLensCoreReady(): Promise<void> {
    const spinner = ora('Ensuring LensCore is ready...').start();

    try {
      const client = await this.getClient();
      const isRunning = await client.checkHealth();

      if (!isRunning) {
        spinner.text = 'Starting LensCore services...';
        const dockerService = await this.getDockerService();
        await dockerService.ensureServicesReady();

        spinner.text = 'Waiting for LensCore to be ready...';
        await client.waitForReady();
      }

      spinner.succeed('LensCore ready');
    } catch (error) {
      spinner.fail('Failed to start LensCore');
      throw error;
    }
  }

  /**
   * Parse project context from string
   */
  static parseProjectContext(projectContext?: string): any {
    if (!projectContext) return undefined;

    const contextParts = projectContext.split(',');
    return {
      framework: contextParts[0]?.trim() || '',
      cssFramework: contextParts[1]?.trim() || '',
      language: contextParts[2]?.trim() || '',
      additionalContext: projectContext,
    };
  }

  /**
   * Parse comma-separated string to array
   */
  static parseCommaSeparated(value?: string): string[] {
    return value ? value.split(',').map((item) => item.trim()) : [];
  }

  /**
   * Parse numeric options with defaults
   */
  static parseNumericOptions(
    options: any,
    defaults: Record<string, number>
  ): Record<string, number> {
    const result: Record<string, number> = {};

    for (const [key, defaultValue] of Object.entries(defaults)) {
      result[key] = parseInt(options[key]) || defaultValue;
    }

    return result;
  }

  /**
   * Display scan results
   */
  static displayScanResults(
    result: any,
    webMode: boolean = false
  ): string | null {
    if (webMode) {
      const webReport = new WebReportService();
      return webReport.generateScanReport(result);
    } else {
      // JSON output mode
      console.log(JSON.stringify(result, null, 2));
      return null;
    }
  }

  /**
   * Display crawl results
   */
  static displayCrawlResults(
    result: any,
    webMode: boolean = false
  ): string | null {
    if (webMode) {
      const webReport = new WebReportService();
      return webReport.generateCrawlReport(result);
    } else {
      // JSON output mode
      console.log(JSON.stringify(result, null, 2));
      return null;
    }
  }

  /**
   * Display test results
   */
  static displayTestResults(
    result: any,
    webMode: boolean = false,
    testUrl?: string
  ): string | null {
    if (webMode) {
      const webReport = new WebReportService();
      return webReport.generateTestReport(result, testUrl || result.url);
    } else {
      // JSON output mode
      console.log(JSON.stringify(result, null, 2));
      return null;
    }
  }

  /**
   * Display multiple test results
   */
  static displayMultipleTestResults(
    result: any,
    webMode: boolean = false
  ): string | null {
    if (webMode) {
      const webReport = new WebReportService();
      return webReport.generateTestMultipleReport(result);
    } else {
      // JSON output mode
      console.log(JSON.stringify(result, null, 2));
      return null;
    }
  }

  /**
   * Display AI status
   */
  static displayAIStatus(options: any, result: any): void {
    if (options.openaiKey) {
      const aiEnabled =
        result.aiEnabled ||
        result.accessibility?.results?.some((r: any) => r.aiEnabled) ||
        result.metadata?.aiEnabled;

      if (aiEnabled) {
        console.log(chalk.blue('🤖 AI analysis enabled'));
      }
    }
  }

  /**
   * Display footer with results URL and optional browser open
   */
  static async displayFooter(
    options: any,
    reportFilename?: string
  ): Promise<void> {
    const webMode = options.web || false;

    if (webMode && reportFilename) {
      const config = await this.loadConfig();
      const port = config?.docker?.port || 3001;
      const webUrl = `http://localhost:${port}/web/${reportFilename}`;

      console.log(chalk.blue(`\n🌐 Open results: ${webUrl}`));

      if (options.open) {
        const { exec } = await import('child_process');
        exec(`open ${webUrl}`);
      }
    }
  }

  /**
   * Handle command errors
   */
  static handleError(error: any, spinner: any, commandName: string): void {
    spinner.fail(`${commandName} failed`);
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }

  /**
   * Get LensCore client instance
   */
  static async getClient(): Promise<LensCoreClient> {
    if (!this.client) {
      const config = await this.loadConfig();
      let baseUrl = 'http://localhost:3001';

      if (config?.mode === 'remote') {
        baseUrl = 'https://api.accesstime.com';
      } else if (config?.mode === 'local' && config?.remote?.baseUrl) {
        baseUrl = config.remote.baseUrl;
      }

      this.client = new LensCoreClient(baseUrl);
    }
    return this.client;
  }

  /**
   * Load configuration from file
   */
  static async loadConfig(): Promise<any> {
    try {
      const configPath = path.join(os.homedir(), '.lenscore', 'config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      return JSON.parse(configData);
    } catch {
      return null;
    }
  }

  /**
   * Check if AI is enabled in config
   */
  static async isAIEnabled(): Promise<boolean> {
    const config = await this.loadConfig();
    return config?.openai?.enabled === true && !!config?.openai?.apiKey;
  }

  /**
   * Get OpenAI config from file
   */
  static async getOpenAIConfig(): Promise<{
    apiKey: string;
    model: string;
  } | null> {
    const config = await this.loadConfig();
    if (config?.openai?.enabled && config?.openai?.apiKey) {
      return {
        apiKey: config.openai.apiKey,
        model: config.openai.model || 'gpt-3.5-turbo',
      };
    }
    return null;
  }

  /**
   * Get Docker service instance
   */
  static async getDockerService(): Promise<DockerService> {
    const config = await this.loadConfig();
    const port = config?.docker?.port || 3001;
    return new DockerService(port);
  }
}
