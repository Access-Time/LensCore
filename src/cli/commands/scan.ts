/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { CommandUtils } from '../utils/command-utils.js';

export async function scanCommand(url: string, options: any) {
  const spinner = ora('Starting scan...').start();

  try {
    console.log(chalk.blue.bold(`\n🔍 Scanning: ${url}\n`));

    await CommandUtils.ensureLensCoreReady();

    const projectContext = CommandUtils.parseProjectContext(
      options.projectContext
    );
    const numericOptions = CommandUtils.parseNumericOptions(options, {
      maxUrls: 10,
      concurrency: 3,
      timeout: 15000,
      maxDepth: 2,
    });

    spinner.text = 'Starting crawl and accessibility scan...';

    const scanOptions = {
      url,
      enableAI: !!options.openaiKey,
      openaiKey: options.openaiKey,
      projectContext,
      ...numericOptions,
    };

    const client = CommandUtils.getClient();
    const result = await client.scan(scanOptions);

    spinner.succeed('Scan completed');

    CommandUtils.displayScanResults(result);
    CommandUtils.displayAIStatus(options, result);
    await CommandUtils.displayFooter(options);
  } catch (error: any) {
    CommandUtils.handleError(error, spinner, 'Scan');
  }
}
