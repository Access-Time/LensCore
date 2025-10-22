/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { DockerService } from '../services/docker.js';

const GPT_MODELS = [
  { name: 'GPT-3.5 Turbo (Fast & Cost-effective)', value: 'gpt-3.5-turbo' },
  { name: 'GPT-4 (Most Accurate)', value: 'gpt-4' },
  { name: 'GPT-4 Turbo (Latest & Fast)', value: 'gpt-4-turbo-preview' },
];

export async function setupCommand() {
  const spinner = ora('Setting up LensCore...').start();

  try {
    console.log(chalk.blue.bold('\n🚀 LensCore Setup\n'));

    const dockerService = new DockerService();

    spinner.text = 'Checking Docker installation...';
    const dockerAvailable = await dockerService.checkDocker();

    if (!dockerAvailable) {
      spinner.fail('Docker not found');
      console.log(chalk.red('Please install Docker first'));
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

    spinner.text = 'Checking Docker Compose...';
    const dockerComposeAvailable = await dockerService.checkDockerCompose();

    if (!dockerComposeAvailable) {
      spinner.fail('Docker Compose not found');
      console.log(chalk.red('Please install Docker Compose first'));
      process.exit(1);
    }

    spinner.succeed('Docker Compose found');

    spinner.stop();

    // Interactive setup
    console.log(chalk.yellow('\n📋 Configuration Options:\n'));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Choose LensCore mode:',
        choices: [
          { name: 'Local mode (run LensCore in Docker)', value: 'local' },
          {
            name: 'Remote mode (connect to existing LensCore instance)',
            value: 'remote',
          },
        ],
        default: 'local',
      },
      {
        type: 'input',
        name: 'localUrl',
        message: 'Enter local LensCore URL:',
        default: 'http://localhost:3001',
        when: (answers) => answers.mode === 'local',
        validate: (input) => {
          if (!input.trim()) {
            return 'Local URL is required for local mode';
          }
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL (e.g., http://localhost:3001)';
          }
        },
      },
      {
        type: 'confirm',
        name: 'enableAI',
        message: 'Enable AI-powered accessibility analysis?',
        default: false,
      },
      {
        type: 'input',
        name: 'openaiKey',
        message: 'Enter your OpenAI API key:',
        when: (answers) => answers.enableAI,
        validate: (input) => {
          if (!input.trim()) {
            return 'API key is required when AI is enabled';
          }
          if (!input.startsWith('sk-')) {
            return 'OpenAI API key should start with "sk-"';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'gptModel',
        message: 'Choose GPT model:',
        choices: GPT_MODELS,
        default: 'gpt-3.5-turbo',
        when: (answers) => answers.enableAI && answers.openaiKey,
      },
    ]);

    // Extract port from local URL for Docker configuration
    let dockerPort = 3001;
    if (answers.mode === 'local' && answers.localUrl) {
      try {
        const url = new URL(answers.localUrl);
        dockerPort = parseInt(url.port) || 3001;
      } catch {
        // Keep default port if URL parsing fails
      }
    }

    // Create configuration
    const config = {
      mode: answers.mode,
      docker: {
        image: 'lenscore:latest',
        port: dockerPort,
      },
      remote: {
        baseUrl:
          answers.mode === 'remote'
            ? 'https://api.accesstime.com'
            : answers.localUrl || 'http://localhost:3001',
      },
      openai: {
        apiKey: answers.openaiKey || '',
        model: answers.gptModel || 'gpt-3.5-turbo',
        enabled: answers.enableAI,
      },
      project: {
        framework: '',
        cssFramework: '',
        language: '',
        buildTool: '',
      },
    };

    // Save configuration
    const configDir = path.join(os.homedir(), '.lenscore');
    await fs.mkdir(configDir, { recursive: true });
    const configPath = path.join(configDir, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    console.log(chalk.green('\n✅ Setup completed successfully!'));
    console.log(chalk.gray(`Configuration saved to: ${configPath}`));

    if (answers.enableAI) {
      console.log(chalk.blue(`🤖 AI Analysis: ${answers.gptModel}`));
    } else {
      console.log(chalk.gray('🤖 AI Analysis: Disabled'));
    }

    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('• Run: lens-core up (to start local instance)'));
    console.log(chalk.gray('• Run: lens-core scan <url> (to scan a website)'));
    if (answers.enableAI) {
      console.log(
        chalk.gray(
          '• Run: lens-core scan <url> --enable-ai (to use AI analysis)'
        )
      );
    }
  } catch (error: any) {
    spinner.fail('Setup failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
