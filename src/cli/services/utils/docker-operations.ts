/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DockerConfigService } from './docker-config';
import { DockerValidationService } from './docker-validation';

const execAsync = promisify(exec);

export class DockerOperationsService {
  private port = 3001;
  private configService: DockerConfigService;
  private validationService: DockerValidationService;

  constructor(port?: number) {
    if (port) {
      this.port = port;
    }
    this.configService = new DockerConfigService();
    this.validationService = new DockerValidationService();
  }

  async build(): Promise<void> {
    const spinner = ora('Building LensCore services...').start();

    try {
      spinner.text = 'Building with docker-compose...';
      const composePath = await this.configService.getDockerComposePath();
      await execAsync(
        `LENSCORE_PORT=${this.port} docker-compose -f "${composePath}" up -d --build`
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
      const composePath = await this.configService.getDockerComposePath();
      const isRunning = await this.validationService.isServiceRunning(
        this.port,
        composePath
      );

      if (isRunning) {
        spinner.succeed('LensCore services already running');
        return;
      }

      spinner.text = 'Starting with docker-compose...';
      await execAsync(
        `LENSCORE_PORT=${this.port} docker-compose -f "${composePath}" up -d --build`
      );

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
      const composePath = await this.configService.getDockerComposePath();
      await execAsync(
        `LENSCORE_PORT=${this.port} docker-compose -f "${composePath}" down`
      );
      spinner.succeed('LensCore services stopped');
    } catch (error) {
      spinner.fail('Failed to stop LensCore services');
      throw error;
    }
  }

  async status(): Promise<void> {
    try {
      const composePath = await this.configService.getDockerComposePath();
      const isRunning = await this.validationService.isServiceRunning(
        this.port,
        composePath
      );

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

  async ensureServicesReady(): Promise<void> {
    const spinner = ora('Ensuring services are ready...').start();

    try {
      const portInUse = await this.validationService.validatePort(this.port);
      if (portInUse) {
        spinner.succeed('Port already in use - services likely running');
        return;
      }

      const imageExists = await this.validationService.validateImage();
      if (!imageExists) {
        spinner.text = 'Image not found, building...';
        await this.build();
        return;
      }

      spinner.text = 'Starting services...';
      await this.start();

      spinner.succeed('Services are ready');
    } catch (error) {
      spinner.fail('Failed to ensure services are ready');
      throw error;
    }
  }
}
