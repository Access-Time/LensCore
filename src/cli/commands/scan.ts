/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { CommandUtils } from '../utils/command-utils';
import { CIOutputService } from '../services/ci-output';

export async function scanCommand(url: string, options: any) {
  const spinner = ora('Starting scan...').start();

  try {
    if (!options.ci) {
      console.log(chalk.blue.bold(`\n🔍 Scanning: ${url}\n`));
    } else {
      console.log(`- Starting scan...`);
      console.log(`🔍 Scanning: ${url}`);
    }

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

    if (!options.ci) {
      spinner.text = 'Starting crawl and accessibility scan...';
    } else {
      console.log('- Ensuring LensCore is ready...');
      console.log('✔ LensCore ready');
      console.log('- Running accessibility scan...');
    }

    const scanOptions = {
      url,
      enableAI: !!aiConfig,
      openaiKey: aiConfig?.apiKey,
      model: aiConfig?.model,
      projectContext,
      skipCache: options.skipCache || false,
      customTests: CommandUtils.parseCommaSeparated(options.customTests),
      customRulesConfig: CommandUtils.parseCommaSeparated(
        options.customRulesConfig
      ),
      customRulesPaths: CommandUtils.parseCommaSeparated(
        options.customRulesPaths
      ),
      disableDefaultRules: CommandUtils.parseCommaSeparated(
        options.disableDefaultRules
      ),
      enableDefaultRules: CommandUtils.parseCommaSeparated(
        options.enableDefaultRules
      ),
      includeApprovedRules: options.approvedRules !== false,
      ...numericOptions,
    };

    const client = await CommandUtils.getClient();
    let result: any;

    try {
      result = await client.scan(scanOptions);
      if (!options.ci) {
        spinner.succeed('Scan completed');
      }
    } catch (error: any) {
      if (options.ci) {
        console.log('✖ Scan failed');
        // Try fallback with test command
        console.log('Scan failed, trying with test command...');
        try {
          const testResult = await client.test({
            url,
            enableAI: !!aiConfig,
            openaiKey: aiConfig?.apiKey,
            projectContext,
            skipCache: options.skipCache || false,
            timeout: numericOptions['timeout'],
          });

          // Create scan-like structure from test result
          const scanResult = {
            crawl: {
              pages: [],
              totalPages: 1,
              crawlTime: 0,
            },
            accessibility: {
              results: [testResult],
              totalPages: 1,
              testTime: testResult.metadata?.processingTime || 0,
            },
            totalTime: testResult.metadata?.processingTime || 0,
          };

          // Handle fallback result
          const exitCode = await CIOutputService.handleScanResult(scanResult, {
            exitOnViolations: options.exitOnViolations !== false,
            outputFile: options.output || 'report.json',
            showDetails: options.showDetails !== false,
          });

          process.exit(exitCode);
        } catch (testError: any) {
          console.log('✖ Scan failed');
          console.error('Error:', testError.message);
          process.exit(1);
        }
      } else {
        throw error;
      }
    }

    // CI mode output
    if (options.ci) {
      const exitCode = await CIOutputService.handleScanResult(result, {
        exitOnViolations: options.exitOnViolations !== false,
        outputFile: options.output || 'report.json',
        showDetails: options.showDetails !== false,
      });

      process.exit(exitCode);
    }

    // Normal mode output
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
    const outputFile = options.output || options.o || '';
    const reportFilename = await CommandUtils.displayScanResults(
      result,
      webMode,
      outputFile
    );
    CommandUtils.displayAIStatus(options, result);
    await CommandUtils.displayFooter(options, reportFilename || undefined);
  } catch (error: any) {
    if (options.ci) {
      console.log('✖ Scan failed');
      console.error('Error:', error.message);
      process.exit(1);
    } else {
      CommandUtils.handleError(error, spinner, 'Scan');
    }
  }
}
