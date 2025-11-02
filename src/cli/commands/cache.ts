/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { CommandUtils } from '../utils/command-utils';

export async function cacheClearCommand() {
  const spinner = ora('Clearing cache...').start();

  try {
    await CommandUtils.ensureLensCoreReady();
    const client = await CommandUtils.getClient();
    const result = await client.clearCache();

    spinner.succeed('Cache cleared successfully');
    console.log(chalk.green('\n✅ ' + result.message));
  } catch (error: any) {
    spinner.fail('Failed to clear cache');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

export async function cacheStatsCommand() {
  const spinner = ora('Fetching cache statistics...').start();

  try {
    await CommandUtils.ensureLensCoreReady();
    const client = await CommandUtils.getClient();
    const result = await client.getCacheStats();

    spinner.succeed('Cache statistics retrieved');
    const stats = result.data;

    console.log(chalk.blue.bold('\n📊 Cache Statistics:'));
    console.log(chalk.gray(`Type: ${stats.cacheType || 'memory'}`));
    console.log(chalk.gray(`TTL: ${stats.ttl || '7200'} seconds`));
    console.log(chalk.green(`\nHits: ${stats.hits || 0}`));
    console.log(chalk.yellow(`Misses: ${stats.misses || 0}`));
    console.log(chalk.blue(`Size: ${stats.size || 0} entries`));
    console.log(chalk.cyan(`Hit Rate: ${stats.hitRatePercentage || 0}%`));
  } catch (error: any) {
    spinner.fail('Failed to get cache statistics');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
