/* eslint-disable no-console */
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';

const execAsync = promisify(exec);

export class DockerService {
  private port = 3001;

  async checkDocker(): Promise<boolean> {
    try {
      await execAsync('docker --version');
      return true;
    } catch {
      return false;
    }
  }

  async checkDockerDaemon(): Promise<boolean> {
    try {
      await execAsync('docker info');
      return true;
    } catch {
      return false;
    }
  }

  async checkDockerCompose(): Promise<boolean> {
    try {
      await execAsync('docker-compose --version');
      return true;
    } catch {
      return false;
    }
  }

  async start(): Promise<void> {
    const spinner = ora('Starting LensCore services...').start();

    try {
      const isRunning = await this.isServiceRunning();

      if (isRunning) {
        spinner.succeed('LensCore services already running');
        return;
      }

      spinner.text = 'Starting with docker-compose...';
      await execAsync('docker-compose up -d --build');

      spinner.succeed('LensCore services started');
      console.log(
        chalk.blue(`🌐 LensCore running at: http://localhost:${this.port}`)
      );
      console.log(chalk.gray('📊 Redis cache available at: localhost:6379'));
    } catch (error) {
      spinner.fail('Failed to start LensCore services');
      throw error;
    }
  }

  async stop(): Promise<void> {
    const spinner = ora('Stopping LensCore services...').start();

    try {
      await execAsync('docker-compose down');
      spinner.succeed('LensCore services stopped');
    } catch (error) {
      spinner.fail('Failed to stop LensCore services');
      throw error;
    }
  }

  async status(): Promise<void> {
    try {
      const isRunning = await this.isServiceRunning();

      if (isRunning) {
        console.log(chalk.green('✅ LensCore services are running'));
        console.log(
          chalk.blue(`🌐 Available at: http://localhost:${this.port}`)
        );
        console.log(chalk.gray('📊 Redis cache: localhost:6379'));
      } else {
        console.log(chalk.red('❌ LensCore services are not running'));
        console.log(chalk.gray('Run "lens-core up" to start them'));
      }
    } catch (error: any) {
      console.error(chalk.red('Error checking status:'), error.message);
    }
  }

  private async isServiceRunning(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        'docker-compose ps --services --filter "status=running"'
      );
      return stdout.includes('lenscore') && stdout.includes('redis');
    } catch {
      return false;
    }
  }
}
