#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from 'commander';
import { setupCommand } from './cli/commands/setup.js';
import { scanCommand } from './cli/commands/scan.js';
import { crawlCommand } from './cli/commands/crawl.js';
import { testCommand } from './cli/commands/test.js';
import { testMultipleCommand } from './cli/commands/test-multiple.js';
import { healthCommand } from './cli/commands/health.js';
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
  .command('crawl <url>')
  .description('Crawl website and discover pages')
  .option('-k, --openai-key <key>', 'OpenAI API key')
  .option(
    '-c, --project-context <context>',
    'Project context (e.g., react,tailwind,typescript)'
  )
  .option('-o, --open', 'Open results in browser')
  .option('-u, --max-urls <number>', 'Maximum URLs to crawl', '10')
  .option('-d, --max-depth <number>', 'Maximum crawl depth', '2')
  .option('-t, --timeout <number>', 'Request timeout in milliseconds', '10000')
  .option('-j, --concurrency <number>', 'Number of concurrent requests', '3')
  .option('-w, --wait-until <condition>', 'Page load condition', 'domcontentloaded')
  .action(crawlCommand);

program
  .command('test <url>')
  .description('Test accessibility of a single page')
  .option('-k, --openai-key <key>', 'OpenAI API key')
  .option(
    '-c, --project-context <context>',
    'Project context (e.g., react,tailwind,typescript)'
  )
  .option('-o, --open', 'Open results in browser')
  .option('-t, --timeout <number>', 'Request timeout in milliseconds', '10000')
  .option('-r, --rules <rules>', 'Specific axe-core rules (comma-separated)')
  .option('-g, --tags <tags>', 'WCAG tags (comma-separated)')
  .option('--no-screenshot', 'Disable screenshot capture')
  .action(testCommand);

program
  .command('test-multiple <urls...>')
  .description('Test accessibility of multiple pages simultaneously')
  .option('-o, --open', 'Open results in browser')
  .option('-t, --timeout <number>', 'Request timeout in milliseconds', '10000')
  .option('-r, --rules <rules>', 'Specific axe-core rules (comma-separated)')
  .option('-g, --tags <tags>', 'WCAG tags (comma-separated)')
  .option('--no-screenshot', 'Disable screenshot capture')
  .action(testMultipleCommand);

program
  .command('scan <url>')
  .description('Crawl website and test accessibility (combined)')
  .option('-k, --openai-key <key>', 'OpenAI API key')
  .option(
    '-c, --project-context <context>',
    'Project context (e.g., react,tailwind,typescript)'
  )
  .option('-o, --open', 'Open results in browser')
  .option('-u, --max-urls <number>', 'Maximum URLs to crawl', '10')
  .option('-d, --max-depth <number>', 'Maximum crawl depth', '2')
  .option('-t, --timeout <number>', 'Request timeout in milliseconds', '15000')
  .option('-j, --concurrency <number>', 'Number of concurrent requests', '3')
  .action(scanCommand);

program
  .command('health')
  .description('Check LensCore health status')
  .action(healthCommand);

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
