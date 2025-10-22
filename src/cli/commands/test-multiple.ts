/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { CommandUtils } from '../utils/command-utils.js';

export async function testMultipleCommand(urls: string[], options: any) {
  const spinner = ora('Starting multiple test...').start();

  try {
    console.log(chalk.blue.bold(`\n♿ Testing Multiple Pages:\n`));
    urls.forEach((url, index) => {
      console.log(chalk.gray(`${index + 1}. ${url}`));
    });
    console.log('');

    await CommandUtils.ensureLensCoreReady();

    const numericOptions = CommandUtils.parseNumericOptions(options, {
      timeout: 10000,
    });

    spinner.text = 'Starting accessibility tests...';

    const testOptions = {
      urls,
      includeScreenshot: options.screenshot !== false,
      rules: CommandUtils.parseCommaSeparated(options.rules),
      tags: CommandUtils.parseCommaSeparated(options.tags),
      ...numericOptions,
    };

    const client = CommandUtils.getClient();
    const result = await client.testMultiple(testOptions);

    spinner.succeed('Multiple test completed');

    CommandUtils.displayMultipleTestResults(result);
    await CommandUtils.displayFooter(options);

  } catch (error: any) {
    CommandUtils.handleError(error, spinner, 'Multiple test');
  }
}