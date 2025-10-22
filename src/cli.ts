#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from 'commander';
import { setupCommand } from './cli/commands/setup.js';
import { scanCommand } from './cli/commands/scan.js';
import { configCommand } from './cli/commands/config.js';
import { GlobalErrorHandler } from './cli/services/error-handler.js';

const program = new Command();

program
  .name('lens-core')
  .description('LensCore CLI - Accessibility testing and web crawling platform')
  .version('0.1.0');

program
  .command('setup')
  .description('Setup LensCore configuration')
  .action(setupCommand);

program
  .command('scan <url>')
  .description('Scan website for accessibility issues')
  .option('-k, --openai-key <key>', 'OpenAI API key')
  .option(
    '-c, --project-context <context>',
    'Project context (e.g., react,tailwind)'
  )
  .option('-o, --open', 'Open results in browser')
  .action(scanCommand);

program
  .command('config')
  .description('Manage configuration')
  .option('-s, --set <key=value>', 'Set configuration value')
  .option('-g, --get <key>', 'Get configuration value')
  .option('-l, --list', 'List all configuration')
  .action(configCommand);

program
  .command('build')
  .description('Build and start LensCore local instance')
  .action(async () => {
    const { DockerService } = await import('./cli/services/docker.js');
    const docker = new DockerService();
    await docker.build();
  });

program
  .command('up')
  .description('Start LensCore local instance')
  .action(async () => {
    const { DockerService } = await import('./cli/services/docker.js');
    const docker = new DockerService();
    await docker.start();
  });

program
  .command('down')
  .description('Stop LensCore local instance')
  .action(async () => {
    const { DockerService } = await import('./cli/services/docker.js');
    const docker = new DockerService();
    await docker.stop();
  });

program
  .command('status')
  .description('Check LensCore status')
  .action(async () => {
    const { DockerService } = await import('./cli/services/docker.js');
    const docker = new DockerService();
    await docker.status();
  });

const errorHandler = new GlobalErrorHandler();

program.parseAsync().catch((error: any) => {
  if (error.code === 'commander.help') {
    process.exit(0);
  }
  errorHandler.handle(error);
});
