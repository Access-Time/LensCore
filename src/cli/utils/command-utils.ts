/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { LensCoreClient } from '../services/lenscore-client.js';
import { DockerService } from '../services/docker.js';

export class CommandUtils {
  private static dockerService = new DockerService();
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
        await this.dockerService.ensureServicesReady();

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
  static displayScanResults(result: any): void {
    console.log(chalk.green.bold('\n✅ Scan Results:'));
    console.log(chalk.gray(`Total pages: ${result.crawl.totalPages}`));
    console.log(chalk.gray(`Scan time: ${result.totalTime}ms`));

    if (result.accessibility.results.length > 0) {
      const violations = result.accessibility.results.reduce(
        (acc: number, r: any) => acc + (r.violations?.length || 0),
        0
      );
      const passes = result.accessibility.results.reduce(
        (acc: number, r: any) => acc + (r.passes?.length || 0),
        0
      );

      console.log(chalk.green(`✅ Passed checks: ${passes}`));
      if (violations > 0) {
        console.log(
          chalk.yellow(`⚠️  Accessibility violations: ${violations}`)
        );
      } else {
        console.log(chalk.green('🎉 No accessibility violations found!'));
      }
    }
  }

  /**
   * Display crawl results
   */
  static displayCrawlResults(result: any): void {
    console.log(chalk.green.bold('\n✅ Crawl Results:'));
    console.log(chalk.gray(`Total pages: ${result.totalPages}`));
    console.log(chalk.gray(`Crawl time: ${result.crawlTime}ms`));

    if (result.pages && result.pages.length > 0) {
      console.log(chalk.blue('\n📄 Discovered Pages:'));
      result.pages.forEach((page: any, index: number) => {
        console.log(chalk.gray(`${index + 1}. ${page.url}`));
        if (page.title) {
          console.log(chalk.gray(`   Title: ${page.title}`));
        }
        if (page.statusCode) {
          console.log(chalk.gray(`   Status: ${page.statusCode}`));
        }
      });
    }
  }

  /**
   * Display test results
   */
  static displayTestResults(result: any): void {
    console.log(chalk.green.bold('\n✅ Test Results:'));
    console.log(chalk.gray(`URL: ${result.url}`));
    console.log(chalk.gray(`Score: ${result.score || 'N/A'}`));

    if (result.violations && result.violations.length > 0) {
      console.log(
        chalk.yellow(
          `⚠️  Accessibility violations: ${result.violations.length}`
        )
      );

      const maxViolations = 3;
      result.violations
        .slice(0, maxViolations)
        .forEach((violation: any, index: number) => {
          console.log(chalk.red(`\n${index + 1}. ${violation.id}`));
          console.log(chalk.gray(`   Impact: ${violation.impact}`));
          console.log(chalk.gray(`   Description: ${violation.description}`));

          if (violation.aiExplanation) {
            console.log(
              chalk.blue(`   AI Explanation: ${violation.aiExplanation}`)
            );
          }
          if (violation.aiRemediation) {
            console.log(
              chalk.green(`   AI Remediation: ${violation.aiRemediation}`)
            );
          }
        });

      if (result.violations.length > maxViolations) {
        console.log(
          chalk.gray(
            `\n... and ${result.violations.length - maxViolations} more violations`
          )
        );
      }
    } else {
      console.log(chalk.green('🎉 No accessibility violations found!'));
    }

    if (result.passes && result.passes.length > 0) {
      console.log(chalk.green(`✅ Passed checks: ${result.passes.length}`));
    }
  }

  /**
   * Display multiple test results
   */
  static displayMultipleTestResults(result: any): void {
    console.log(chalk.green.bold('\n✅ Multiple Test Results:'));
    console.log(chalk.gray(`Total pages: ${result.totalPages}`));
    console.log(chalk.gray(`Test time: ${result.testTime}ms`));

    if (result.results && result.results.length > 0) {
      let totalViolations = 0;
      let totalPasses = 0;

      result.results.forEach((pageResult: any, index: number) => {
        console.log(chalk.blue(`\n📄 Page ${index + 1}: ${pageResult.url}`));
        console.log(chalk.gray(`Score: ${pageResult.score || 'N/A'}`));

        if (pageResult.violations && pageResult.violations.length > 0) {
          console.log(
            chalk.yellow(`⚠️  Violations: ${pageResult.violations.length}`)
          );
          totalViolations += pageResult.violations.length;

          const firstViolation = pageResult.violations[0];
          console.log(
            chalk.red(
              `   • ${firstViolation.id}: ${firstViolation.description}`
            )
          );
        } else {
          console.log(chalk.green('✅ No violations found'));
        }

        if (pageResult.passes && pageResult.passes.length > 0) {
          console.log(
            chalk.green(`✅ Passed checks: ${pageResult.passes.length}`)
          );
          totalPasses += pageResult.passes.length;
        }

        if (pageResult.screenshot) {
          console.log(chalk.blue(`📸 Screenshot: ${pageResult.screenshot}`));
        }
      });

      console.log(chalk.green.bold('\n📊 Summary:'));
      console.log(chalk.green(`✅ Total passed checks: ${totalPasses}`));
      if (totalViolations > 0) {
        console.log(chalk.yellow(`⚠️  Total violations: ${totalViolations}`));
      } else {
        console.log(chalk.green('🎉 No violations found across all pages!'));
      }
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
  static async displayFooter(options: any): Promise<void> {
    console.log(chalk.blue('\n🌐 Open results: http://localhost:3000'));

    if (options.open) {
      const { exec } = await import('child_process');
      exec('open http://localhost:3000');
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
  static getDockerService(): DockerService {
    return this.dockerService;
  }
}
