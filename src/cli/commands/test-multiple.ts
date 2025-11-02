/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { CommandUtils } from '../utils/command-utils';

export async function testMultipleCommand(urls: string[], options: any) {
  const spinner = ora('Starting multiple test...').start();

  try {
    console.log(chalk.blue.bold('\n♿ Testing Multiple Pages:\n'));
    urls.forEach((url, index) => {
      console.log(chalk.gray(`${index + 1}. ${url}`));
    });
    console.log('');

    await CommandUtils.ensureLensCoreReady();

    const projectContext = CommandUtils.parseProjectContext(
      options.projectContext
    );
    const numericOptions = CommandUtils.parseNumericOptions(options, {
      timeout: 10000,
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

    spinner.text = 'Starting accessibility tests...';

    const testOptions = {
      urls,
      enableAI: !!aiConfig,
      openaiKey: aiConfig?.apiKey,
      projectContext,
      includeScreenshot: options.screenshot !== false,
      skipCache: options.skipCache || false,
      rules: CommandUtils.parseCommaSeparated(options.rules),
      tags: CommandUtils.parseCommaSeparated(options.tags),
      ...numericOptions,
    };

    const client = await CommandUtils.getClient();
    const result = await client.testMultiple(testOptions);

    spinner.succeed('Multiple test completed');

    const webMode = options.web || false;
    const reportFilename = CommandUtils.displayMultipleTestResults(
      result,
      webMode
    );
    await CommandUtils.displayFooter(options, reportFilename || undefined);
  } catch (error: any) {
    CommandUtils.handleError(error, spinner, 'Multiple Test');
  }
}
