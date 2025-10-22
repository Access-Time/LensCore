/* eslint-disable no-console */
import chalk from 'chalk';

export class GlobalErrorHandler {
  handle(error: any): void {
    console.error(chalk.red.bold('\n❌ Error:'));

    if (error.code === 'ENOTFOUND') {
      console.error(
        chalk.red('Network error: Unable to connect to the server')
      );
    } else if (error.code === 'ECONNREFUSED') {
      console.error(chalk.red('Connection refused: Server is not running'));
    } else if (error.message.includes('Docker')) {
      console.error(chalk.red('Docker error:'), error.message);
    } else if (error.message.includes('timeout')) {
      console.error(chalk.red('Timeout error:'), error.message);
    } else {
      console.error(chalk.red(error.message));
    }

    console.log(chalk.gray('\n💡 Troubleshooting:'));
    console.log(chalk.gray('• Run "lens-core setup" to configure'));
    console.log(chalk.gray('• Run "lens-core status" to check service status'));
    console.log(chalk.gray('• Check Docker is running: docker info'));

    process.exit(1);
  }
}
