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

    const scanOptions = {
      url,
      enableAI: !!aiConfig,
      openaiKey: aiConfig?.apiKey,
      projectContext,
      ...numericOptions,
    };

    const client = await CommandUtils.getClient();
    const result = await client.scan(scanOptions);

    spinner.succeed('Scan completed');

    const webMode = options.web || false;
    const reportFilename = CommandUtils.displayScanResults(result, webMode);
    CommandUtils.displayAIStatus(options, result);
    await CommandUtils.displayFooter(options, reportFilename || undefined);
  } catch (error: any) {
    CommandUtils.handleError(error, spinner, 'Scan');
  }
}
