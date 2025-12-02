/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { CommandUtils } from '../utils/command-utils';

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

    // Handle AI options
    let aiConfig = null;
    if (options.enableAi) {
      aiConfig = await CommandUtils.getOpenAIConfig();
      if (!aiConfig) {
        throw new Error(
          'AI is enabled but no API key found in config. Run "lens-core setup" to configure AI.'
        );
      }
    } else if (options.openaiKey) {
      aiConfig = {
        apiKey: options.openaiKey,
        model: 'gpt-3.5-turbo',
      };
    }

    spinner.text = 'Starting crawl and accessibility scan...';

    const customTests = CommandUtils.parseCommaSeparated(options.customTests);

    if (customTests.includes('responsive') && !aiConfig) {
      throw new Error(
        'Responsive test requires AI API key. Use --enable-ai or --openai-key option.'
      );
    }

    const scanOptions = {
      url,
      enableAI: !!aiConfig,
      openaiKey: aiConfig?.apiKey,
      projectContext,
      skipCache: options.skipCache || false,
      customTests,
      ...numericOptions,
    };

    const client = await CommandUtils.getClient();
    const result = await client.scan(scanOptions);

    spinner.succeed('Scan completed');

    const totalTime = result.totalTime || 0;
    const totalPages = result.crawl?.totalPages || 0;

    if (totalTime < 1000 && totalPages > 0 && !options.skipCache) {
      console.log(
        chalk.yellow(
          '\n⚠️  Scan completed very quickly - results may be from cache.'
        )
      );
      console.log(chalk.gray('   Use --skip-cache to force a fresh scan.\n'));
    }

    const webMode = options.web || false;
    const reportFilename = CommandUtils.displayScanResults(result, webMode);
    CommandUtils.displayAIStatus(options, result);
    await CommandUtils.displayFooter(options, reportFilename || undefined);
  } catch (error: any) {
    CommandUtils.handleError(error, spinner, 'Scan');
  }
}
