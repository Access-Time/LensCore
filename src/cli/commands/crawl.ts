/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { CommandUtils } from '../utils/command-utils.js';

export async function crawlCommand(url: string, options: any) {
  const spinner = ora('Starting crawl...').start();

  try {
    console.log(chalk.blue.bold(`\n🕷️ Crawling: ${url}\n`));

    await CommandUtils.ensureLensCoreReady();

    const projectContext = CommandUtils.parseProjectContext(options.projectContext);
    const numericOptions = CommandUtils.parseNumericOptions(options, {
      maxUrls: 10,
      concurrency: 3,
      timeout: 10000,
      maxDepth: 2,
    });

    spinner.text = 'Starting website crawl...';

    const crawlOptions = {
      url,
      enableAI: !!options.openaiKey,
      openaiKey: options.openaiKey,
      projectContext,
      waitUntil: options.waitUntil || 'domcontentloaded',
      rules: options.rules || {},
      ...numericOptions,
    };

    const client = CommandUtils.getClient();
    const result = await client.crawl(crawlOptions);

    spinner.succeed('Crawl completed');

    CommandUtils.displayCrawlResults(result);
    CommandUtils.displayAIStatus(options, result);
    await CommandUtils.displayFooter(options);

  } catch (error: any) {
    CommandUtils.handleError(error, spinner, 'Crawl');
  }
}