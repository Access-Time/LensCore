/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { CommandUtils } from '../utils/command-utils.js';

export async function testCommand(url: string, options: any) {
  const spinner = ora('Starting test...').start();

  try {
    console.log(chalk.blue.bold(`\n♿ Testing: ${url}\n`));

    await CommandUtils.ensureLensCoreReady();

    const projectContext = CommandUtils.parseProjectContext(options.projectContext);
    const numericOptions = CommandUtils.parseNumericOptions(options, {
      timeout: 10000,
    });

    spinner.text = 'Starting accessibility test...';

    const testOptions = {
      url,
      enableAI: !!options.openaiKey,
      openaiKey: options.openaiKey,
      projectContext,
      includeScreenshot: options.screenshot !== false,
      rules: CommandUtils.parseCommaSeparated(options.rules),
      tags: CommandUtils.parseCommaSeparated(options.tags),
      ...numericOptions,
    };

    const client = CommandUtils.getClient();
    const result = await client.test(testOptions);

    spinner.succeed('Test completed');

    CommandUtils.displayTestResults(result);
    CommandUtils.displayAIStatus(options, result);
    await CommandUtils.displayFooter(options);

  } catch (error: any) {
    CommandUtils.handleError(error, spinner, 'Test');
  }
}