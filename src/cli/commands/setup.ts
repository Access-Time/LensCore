/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { DockerService } from '../services/docker.js';

export async function setupCommand() {
  const spinner = ora('Setting up LensCore...').start();

  try {
    console.log(chalk.blue.bold('\n🚀 LensCore Setup\n'));

    const dockerService = new DockerService();

    spinner.text = 'Checking Docker installation...';
    const dockerAvailable = await dockerService.checkDocker();

    if (!dockerAvailable) {
      spinner.fail('Docker not found');
      console.log(
        chalk.red(
          'Please install Docker first: https://docs.docker.com/get-docker/'
        )
      );
      process.exit(1);
    }

    spinner.succeed('Docker found');

    spinner.text = 'Checking Docker daemon...';
    const dockerRunning = await dockerService.checkDockerDaemon();

    if (!dockerRunning) {
      spinner.fail('Docker daemon not running');
      console.log(chalk.red('Please start Docker daemon first'));
      process.exit(1);
    }

    spinner.succeed('Docker daemon running');

    console.log(chalk.yellow('\n📋 Configuration Options:'));
    console.log(chalk.gray('1. Local mode (run LensCore in Docker)'));
    console.log(
      chalk.gray('2. Remote mode (connect to existing LensCore instance)')
    );

    const configDir = path.join(os.homedir(), '.lenscore');
    await fs.mkdir(configDir, { recursive: true });

    const config = {
      mode: 'local',
      docker: {
        image: 'lenscore:latest',
        port: 3001,
      },
      remote: {
        baseUrl: 'http://localhost:3001',
      },
      openai: {
        apiKey: '',
        model: 'gpt-3.5-turbo',
      },
      project: {
        framework: '',
        cssFramework: '',
        language: '',
        buildTool: '',
      },
    };

    const configPath = path.join(configDir, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    spinner.succeed('Configuration saved');

    console.log(chalk.green.bold('\n✅ Setup completed successfully!'));
    console.log(chalk.gray(`Configuration saved to: ${configPath}`));
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('• Run: lens-core up (to start local instance)'));
    console.log(chalk.gray('• Run: lens-core scan <url> (to scan a website)'));
  } catch (error: any) {
    spinner.fail('Setup failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
