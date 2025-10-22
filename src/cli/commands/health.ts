/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { CommandUtils } from '../utils/command-utils.js';

export async function healthCommand() {
  const spinner = ora('Checking LensCore health...').start();

  try {
    const client = await CommandUtils.getClient();
    const isHealthy = await client.checkHealth();

    if (isHealthy) {
      spinner.succeed('LensCore is healthy');

      try {
        const response = await fetch('http://localhost:3001/api/health');
        const healthData = await response.json();

        console.log(chalk.green.bold('\n✅ Health Status:'));
        console.log(chalk.gray(`Status: ${healthData.status}`));
        console.log(chalk.gray(`Timestamp: ${healthData.timestamp}`));

        console.log(chalk.blue('\n🔧 Services:'));
        for (const service in healthData.services) {
          console.log(
            chalk.gray(`  ${service}: ${healthData.services[service]}`)
          );
        }
        console.log(chalk.blue('\n🌐 API available at: http://localhost:3001'));
        console.log(chalk.gray('📊 Redis cache: localhost:6379'));
      } catch {
        console.log(chalk.green('✅ LensCore is running'));
      }
    } else {
      spinner.fail('LensCore is not healthy');
      console.log(chalk.red('\n❌ LensCore is not responding'));
      console.log(chalk.gray('💡 Try running: lens-core up'));
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail('Failed to check health');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}