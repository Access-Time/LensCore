/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';

const execAsync = promisify(exec);

export class DockerService {
  private port = 3001;

  constructor(port?: number) {
    if (port) {
      this.port = port;
    }
  }

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

  async build(): Promise<void> {
    const spinner = ora('Building LensCore services...').start();

    try {
      spinner.text = 'Building with docker-compose...';
      await execAsync(
        `LENSCORE_PORT=${this.port} docker-compose up -d --build`
      );

      spinner.succeed('LensCore services built and started');
      console.log(
        chalk.blue(`🌐 LensCore running at: http://localhost:${this.port}`)
      );
      console.log(chalk.gray('📊 Redis cache available at: localhost:6379'));
    } catch (error) {
      spinner.fail('Failed to build LensCore services');
      throw error;
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
      await execAsync(`LENSCORE_PORT=${this.port} docker-compose up -d`);

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
      await execAsync(`LENSCORE_PORT=${this.port} docker-compose down`);
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

  async validatePort(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`lsof -i :${this.port}`);
      return stdout.includes('LISTEN');
    } catch {
      return false;
    }
  }

  async validateImage(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        'docker images --format "{{.Repository}}:{{.Tag}}"'
      );
      return stdout.includes('lenscore-lenscore:latest');
    } catch {
      return false;
    }
  }

  async ensureServicesReady(): Promise<void> {
    const spinner = ora('Ensuring services are ready...').start();

    try {
      const portInUse = await this.validatePort();
      if (portInUse) {
        spinner.succeed('Port already in use - services likely running');
        return;
      }

      // Check if image exists
      const imageExists = await this.validateImage();
      if (!imageExists) {
        spinner.text = 'Image not found, building...';
        await this.build();
        return;
      }

      // Start services
      spinner.text = 'Starting services...';
      await this.start();

      spinner.succeed('Services are ready');
    } catch (error) {
      spinner.fail('Failed to ensure services are ready');
      throw error;
    }
  }

  private async isServiceRunning(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `LENSCORE_PORT=${this.port} docker-compose ps --services --filter "status=running"`
      );
      return stdout.includes('lenscore') && stdout.includes('redis');
    } catch {
      return false;
    }
  }
}
