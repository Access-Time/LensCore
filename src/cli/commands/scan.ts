/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { LensCoreClient } from '../services/lenscore-client.js';
import { DockerService } from '../services/docker.js';

export async function scanCommand(url: string, options: any) {
  const spinner = ora('Starting scan...').start();

  try {
    console.log(chalk.blue.bold(`\n🔍 Scanning: ${url}\n`));

    const dockerService = new DockerService();
    const client = new LensCoreClient();

    spinner.text = 'Checking LensCore status...';
    const isRunning = await client.checkHealth();

    if (!isRunning) {
      spinner.text = 'Starting LensCore local instance...';
      await dockerService.start();

      spinner.text = 'Waiting for LensCore to be ready...';
      await client.waitForReady();
    }

    spinner.succeed('LensCore ready');

    spinner.text = 'Starting crawl and accessibility scan...';

    const scanOptions = {
      url,
      enableAI: !!options.openaiKey,
      projectContext: options.projectContext
        ? {
            additionalContext: options.projectContext,
          }
        : undefined,
    };

    const result = await client.scan(scanOptions);

    spinner.succeed('Scan completed');

    console.log(chalk.green.bold('\n✅ Scan Results:'));
    console.log(chalk.gray(`Total pages: ${result.crawl.totalPages}`));
    console.log(chalk.gray(`Scan time: ${result.totalTime}ms`));

    if (result.accessibility.results.length > 0) {
      const violations = result.accessibility.results.reduce(
        (acc: number, r: any) => acc + r.violations.length,
        0
      );
      console.log(chalk.yellow(`Accessibility violations: ${violations}`));
    }

    console.log(chalk.blue('\n🌐 Open results: http://localhost:3000'));

    if (options.open) {
      const { exec } = await import('child_process');
      exec('open http://localhost:3000');
    }
  } catch (error: any) {
    spinner.fail('Scan failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
