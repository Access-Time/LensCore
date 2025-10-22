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

    spinner.text = 'Starting accessibility test...';

    const testOptions = {
      url,
      enableAI: !!aiConfig,
      openaiKey: aiConfig?.apiKey,
      projectContext,
      includeScreenshot: options.screenshot !== false,
      rules: CommandUtils.parseCommaSeparated(options.rules),
      tags: CommandUtils.parseCommaSeparated(options.tags),
      ...numericOptions,
    };

    const client = await CommandUtils.getClient();
    const result = await client.test(testOptions);

    spinner.succeed('Test completed');

    const webMode = options.web || false;
    CommandUtils.displayTestResults(result, webMode);
    CommandUtils.displayAIStatus(options, result);
    await CommandUtils.displayFooter(options);
  } catch (error: any) {
    CommandUtils.handleError(error, spinner, 'Test');
  }
}
