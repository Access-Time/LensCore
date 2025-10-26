#!/usr/bin/env node

import { Command } from 'commander';
import { setupCommand } from './cli/commands/setup.js';
import { scanCommand } from './cli/commands/scan.js';
import { crawlCommand } from './cli/commands/crawl.js';
import { testCommand } from './cli/commands/test.js';
import { testMultipleCommand } from './cli/commands/test-multiple.js';
import { healthCommand } from './cli/commands/health.js';
import { configCommand } from './cli/commands/config.js';
import { GlobalErrorHandler } from './cli/services/error-handler.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

const program = new Command();

program
  .name('lens-core')
  .description('LensCore CLI - Accessibility testing and web crawling platform')
  .version(packageJson.version);

// ============================================================================
// SETUP & CONFIGURATION COMMANDS
// ============================================================================

program
  .command('setup')
  .description('Setup LensCore configuration and Docker environment')
  .option('-p, --port <port>', 'Set custom port for LensCore (default: 3001)')
  .option(
    '-u, --url <url>',
    'Set custom URL for LensCore (e.g., http://localhost:3003)'
  )
  .option('--ai', 'Enable AI analysis during setup')
  .option('-k, --openai-key <key>', 'Set OpenAI API key')
  .action(setupCommand);

program
  .command('config')
  .description('Manage LensCore configuration settings')
  .option(
    '-s, --set <key=value>',
    'Set configuration value (e.g., docker.port=3003)'
  )
  .option('-g, --get <key>', 'Get configuration value (e.g., docker.port)')
  .option('-l, --list', 'List all configuration settings')
  .action(configCommand);

// ============================================================================
// TESTING COMMANDS
// ============================================================================

program
  .command('crawl <url>')
  .description('Crawl website and discover pages')
  .option('-w, --web', 'Open results in browser (default: JSON output)')
  .option('-u, --max-urls <number>', 'Maximum URLs to crawl', '10')
  .option('-d, --max-depth <number>', 'Maximum crawl depth', '2')
  .option('-t, --timeout <number>', 'Request timeout in milliseconds', '10000')
  .option('-j, --concurrency <number>', 'Number of concurrent requests', '3')
  .option(
    '-l, --wait-until <condition>',
    'Page load condition',
    'domcontentloaded'
  )
  .action(crawlCommand);

program
  .command('test <url>')
  .description('Test accessibility of a single page')
  .option('--enable-ai', 'Enable AI analysis (uses config API key)')
  .option('-k, --openai-key <key>', 'Override OpenAI API key')
  .option(
    '-c, --project-context <context>',
    'Project context (e.g., react,tailwind,typescript)'
  )
  .option('-w, --web', 'Open results in browser (default: JSON output)')
  .option('-t, --timeout <number>', 'Request timeout in milliseconds', '10000')
  .option('-r, --rules <rules>', 'Specific axe-core rules (comma-separated)')
  .option('-g, --tags <tags>', 'WCAG tags (comma-separated)')
  .option('--no-screenshot', 'Disable screenshot capture')
  .action(testCommand);

program
  .command('test-multiple <urls...>')
  .description('Test accessibility of multiple pages simultaneously')
  .option('--enable-ai', 'Enable AI analysis (uses config API key)')
  .option('-k, --openai-key <key>', 'Override OpenAI API key')
  .option(
    '-c, --project-context <context>',
    'Project context (e.g., react,tailwind,typescript)'
  )
  .option('-w, --web', 'Open results in browser (default: JSON output)')
  .option('-t, --timeout <number>', 'Request timeout in milliseconds', '10000')
  .option('-r, --rules <rules>', 'Specific axe-core rules (comma-separated)')
  .option('-g, --tags <tags>', 'WCAG tags (comma-separated)')
  .option('--no-screenshot', 'Disable screenshot capture')
  .action(testMultipleCommand);

program
  .command('scan <url>')
  .description('Crawl website and test accessibility (combined)')
  .option('--enable-ai', 'Enable AI analysis (uses config API key)')
  .option('-k, --openai-key <key>', 'Override OpenAI API key')
  .option(
    '-c, --project-context <context>',
    'Project context (e.g., react,tailwind,typescript)'
  )
  .option('-w, --web', 'Open results in browser (default: JSON output)')
  .option('-u, --max-urls <number>', 'Maximum URLs to crawl', '10')
  .option('-d, --max-depth <number>', 'Maximum crawl depth', '2')
  .option('-t, --timeout <number>', 'Request timeout in milliseconds', '15000')
  .option('-j, --concurrency <number>', 'Number of concurrent requests', '3')
  .action(scanCommand);

// ============================================================================
// SYSTEM COMMANDS
// ============================================================================

program
  .command('health')
  .description('Check LensCore health status')
  .action(healthCommand);

program
  .command('build')
  .description('Build and start LensCore Docker services')
  .action(async () => {
    const { DockerService } = await import('./cli/services/docker.js');
    const { CommandUtils } = await import('./cli/utils/command-utils.js');
    const config = await CommandUtils.loadConfig();
    const port = config?.docker?.port || 3001;
    const docker = new DockerService(port);
    await docker.build();
  });

program
  .command('up')
  .description('Start LensCore Docker services')
  .action(async () => {
    const { DockerService } = await import('./cli/services/docker.js');
    const { CommandUtils } = await import('./cli/utils/command-utils.js');
    const config = await CommandUtils.loadConfig();
    const port = config?.docker?.port || 3001;
    const docker = new DockerService(port);
    await docker.start();
  });

program
  .command('down')
  .description('Stop LensCore Docker services')
  .action(async () => {
    const { DockerService } = await import('./cli/services/docker.js');
    const { CommandUtils } = await import('./cli/utils/command-utils.js');
    const config = await CommandUtils.loadConfig();
    const port = config?.docker?.port || 3001;
    const docker = new DockerService(port);
    await docker.stop();
  });

program
  .command('status')
  .description('Check LensCore Docker services status')
  .action(async () => {
    const { DockerService } = await import('./cli/services/docker.js');
    const { CommandUtils } = await import('./cli/utils/command-utils.js');
    const config = await CommandUtils.loadConfig();
    const port = config?.docker?.port || 3001;
    const docker = new DockerService(port);
    await docker.status();
  });

// ============================================================================
// ERROR HANDLING
// ============================================================================

const errorHandler = new GlobalErrorHandler();

program.parseAsync().catch((error: unknown) => {
  if ((error as { code?: string }).code === 'commander.help') {
    process.exit(0);
  }
  errorHandler.handle(error);
});
