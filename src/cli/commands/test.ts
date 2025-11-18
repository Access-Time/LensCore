/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { CommandUtils } from '../utils/command-utils';
import { CIOutputService } from '../services/ci-output';

export async function testCommand(url: string, options: any) {
  const spinner = ora('Starting test...').start();

  try {
    if (!options.ci) {
      console.log(chalk.blue.bold(`\n♿ Testing: ${url}\n`));
    } else {
      console.log(`- Starting test...`);
      console.log(`♿ Testing: ${url}`);
    }

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

    if (!options.ci) {
      spinner.text = 'Starting accessibility test...';
    } else {
      console.log('- Ensuring LensCore is ready...');
      console.log('✔ LensCore ready');
      console.log('- Running accessibility test...');
    }

    const testOptions = {
      url,
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
    const result = await client.test(testOptions);

    if (!options.ci) {
      spinner.succeed('Test completed');
    }

    // CI mode output
    if (options.ci) {
      const exitCode = await CIOutputService.handleTestResult(result, {
        exitOnViolations: options.exitOnViolations !== false,
        outputFile: options.output || 'report.json',
        showDetails: options.showDetails !== false,
      });

      process.exit(exitCode);
    }

    // Normal mode output
    const webMode = options.web || false;
    const reportFilename = CommandUtils.displayTestResults(
      result,
      webMode,
      url
    );
    CommandUtils.displayAIStatus(options, result);
    await CommandUtils.displayFooter(options, reportFilename || undefined);
  } catch (error: any) {
    if (options.ci) {
      console.log('✖ Test failed');
      console.error('Error:', error.message);
      process.exit(1);
    } else {
      CommandUtils.handleError(error, spinner, 'Test');
    }
  }
}
