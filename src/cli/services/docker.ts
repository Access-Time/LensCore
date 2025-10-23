/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';

const execAsync = promisify(exec);

export class DockerService {
  private port = 3001;
  private dockerComposePath: string | null = null;

  constructor(port?: number) {
    if (port) {
      this.port = port;
    }
  }

  private async getDockerComposePath(): Promise<string> {
    if (this.dockerComposePath) {
      return this.dockerComposePath;
    }

    const currentDirPath = path.join(process.cwd(), 'docker-compose.yml');
    try {
      await fs.access(currentDirPath);
      this.dockerComposePath = currentDirPath;
      return this.dockerComposePath;
    } catch {
      // File not found in current directory
    }

    try {
      const packagePath = require.resolve('@accesstime/lenscore');
      const packageDir = path.dirname(packagePath);
      const packageComposePath = path.join(packageDir, 'docker-compose.yml');

      await fs.access(packageComposePath);
      this.dockerComposePath = packageComposePath;
      return this.dockerComposePath;
    } catch {
      // Package path not found
    }

    const homeDir = os.homedir();
    const lenscoreDir = path.join(homeDir, '.lenscore');
    const composePath = path.join(lenscoreDir, 'docker-compose.yml');
    const dockerfilePath = path.join(lenscoreDir, 'Dockerfile');

    try {
      await fs.mkdir(lenscoreDir, { recursive: true });

      const dockerComposeContent = `services:
  lenscore-init:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - node_modules_data:/app/node_modules
    profiles: ['init']

  lenscore:
    container_name: lenscore-app
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '\${LENSCORE_PORT:-3001}:\${LENSCORE_PORT:-3001}'
    environment:
      - NODE_ENV=development
      - PORT=\${LENSCORE_PORT:-3001}
      - CACHE_TYPE=redis
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - ./logs:/app/logs
      - ./cache:/app/cache
      - ./web:/app/web
      - ./storage:/app/storage
      - node_modules_data:/app/node_modules
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
  node_modules_data:`;

      const dockerfileContent = `FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install instead of npm ci since package-lock.json might not exist)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

# Install system dependencies for Puppeteer
RUN apk add --no-cache \\
  chromium \\
  nss \\
  freetype \\
  freetype-dev \\
  harfbuzz \\
  ca-certificates \\
  ttf-freefont

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \\
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \\
  NODE_ENV=production

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create necessary directories
RUN mkdir -p logs storage

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]`;

      const packageJsonPath = path.join(lenscoreDir, 'package.json');
      let packageJsonContent;

      try {
        const currentFile = __filename;
        const packageDir = path.resolve(currentFile, '../../../../');
        const originalPackageJsonPath = path.join(packageDir, 'package.json');
        const originalPackageJson = await fs.readFile(
          originalPackageJsonPath,
          'utf8'
        );
        packageJsonContent = JSON.parse(originalPackageJson);

        packageJsonContent.scripts = {
          start: 'node dist/index.js',
          build: 'tsc',
          'build:cli': 'tsc -p tsconfig.cli.json',
        };
        
        // Ensure all necessary dependencies are included
        packageJsonContent.dependencies = {
          ...packageJsonContent.dependencies,
          '@google-cloud/storage': '^7.7.0',
          'aws-sdk': '^2.1490.0',
          'axe-core': '^4.8.2',
          cheerio: '^1.0.0',
          cors: '^2.8.5',
          dotenv: '^16.3.1',
          express: '^4.18.2',
          helmet: '^7.1.0',
          ioredis: '^5.8.1',
          openai: '^6.5.0',
          puppeteer: '^24.15.0',
          sharp: '^0.33.0',
          uuid: '^9.0.1',
          winston: '^3.11.0',
          zod: '^3.22.4',
        };
      } catch {
        packageJsonContent = {
          name: 'lenscore',
          version: '1.0.0',
          main: 'dist/index.js',
          scripts: {
            start: 'node dist/index.js',
            build: 'tsc',
            'build:cli': 'tsc -p tsconfig.cli.json',
          },
          dependencies: {
            '@google-cloud/storage': '^7.7.0',
            'aws-sdk': '^2.1490.0',
            'axe-core': '^4.8.2',
            cheerio: '^1.0.0',
            cors: '^2.8.5',
            dotenv: '^16.3.1',
            express: '^4.18.2',
            helmet: '^7.1.0',
            ioredis: '^5.8.1',
            openai: '^6.5.0',
            puppeteer: '^24.15.0',
            sharp: '^0.33.0',
            uuid: '^9.0.1',
            winston: '^3.11.0',
            zod: '^3.22.4',
          },
          devDependencies: {
            typescript: '^5.3.3',
          },
        };
      }

      await fs.writeFile(composePath, dockerComposeContent);
      await fs.writeFile(dockerfilePath, dockerfileContent);
      await fs.writeFile(
        packageJsonPath,
        JSON.stringify(packageJsonContent, null, 2)
      );

      try {
        // Try multiple approaches to find the package directory
        const possiblePackageDirs = [
          // Development mode - from source
          path.resolve(__filename, '../../../../'),
          // Global install mode - from node_modules
          path.resolve(require.resolve('@accesstime/lenscore'), '../..'),
          // Alternative global install path
          path.dirname(require.resolve('@accesstime/lenscore')),
        ];

        let packageDir: string | null = null;
        for (const dir of possiblePackageDirs) {
          try {
            const packageJsonPath = path.join(dir, 'package.json');
            await fs.access(packageJsonPath);
            packageDir = dir;
            break;
          } catch {
            // Continue to next path
          }
        }

        if (!packageDir) {
          throw new Error('Could not find package directory');
        }

        // Copy TypeScript config files
        const tsconfigFiles = ['tsconfig.json', 'tsconfig.cli.json'];
        for (const tsconfigFile of tsconfigFiles) {
          try {
            const srcPath = path.join(packageDir, tsconfigFile);
            const destPath = path.join(lenscoreDir, tsconfigFile);
            await fs.copyFile(srcPath, destPath);
          } catch {
            // Skip if file not found
          }
        }

        // Copy package-lock.json if it exists
        try {
          const packageLockSrc = path.join(packageDir, 'package-lock.json');
          const packageLockDest = path.join(lenscoreDir, 'package-lock.json');
          await fs.copyFile(packageLockSrc, packageLockDest);
        } catch {
          // Skip if package-lock.json not found
        }

        // Copy source directory
        const srcDir = path.join(packageDir, 'src');
        const destSrcDir = path.join(lenscoreDir, 'src');
        try {
          await fs.access(srcDir);
          await this.copyDirectory(srcDir, destSrcDir);
        } catch {
          // Skip if directory not found
        }

        // Copy web directory with templates - CRITICAL for global usage
        const webDir = path.join(packageDir, 'web');
        const destWebDir = path.join(lenscoreDir, 'web');
        try {
          await fs.access(webDir);
          await this.copyDirectory(webDir, destWebDir);
          console.log(`✅ Copied web templates from ${webDir} to ${destWebDir}`);
        } catch (error) {
          console.warn(`⚠️  Could not copy web templates: ${error}`);
          // This is critical for global usage, so we'll create a fallback
          await this.createFallbackTemplates(destWebDir);
        }

        // Ensure output directory exists
        const outputDir = path.join(destWebDir, 'output');
        try {
          await fs.mkdir(outputDir, { recursive: true });
          console.log(`✅ Created output directory: ${outputDir}`);
        } catch (error) {
          console.warn(`⚠️  Could not create output directory: ${error}`);
        }
      } catch (error) {
        console.warn(`⚠️  Package setup warning: ${error}`);
        // Create fallback templates even if package setup fails
        await this.createFallbackTemplates(path.join(lenscoreDir, 'web'));
      }

      this.dockerComposePath = composePath;
      return this.dockerComposePath;
    } catch (error) {
      throw new Error(`Failed to setup docker-compose.yml: ${error}`);
    }
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  private async createFallbackTemplates(webDir: string): Promise<void> {
    try {
      const templatesDir = path.join(webDir, 'templates');
      await fs.mkdir(templatesDir, { recursive: true });

      // Create basic HTML templates as fallback
      const templates = {
        'scan-results.html': this.getScanTemplate(),
        'crawl-results.html': this.getCrawlTemplate(),
        'test-results.html': this.getTestTemplate(),
        'test-multiple-results.html': this.getTestMultipleTemplate(),
      };

      for (const [filename, content] of Object.entries(templates)) {
        const filePath = path.join(templatesDir, filename);
        await fs.writeFile(filePath, content, 'utf8');
      }

      console.log(`✅ Created fallback templates in ${templatesDir}`);
    } catch (error) {
      console.error(`❌ Failed to create fallback templates: ${error}`);
    }
  }

  private getScanTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LensCore Scan Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat { background: #e9ecef; padding: 15px; border-radius: 5px; flex: 1; }
        .violations { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .passed { background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 LensCore Scan Results</h1>
        <p>Scan completed at: {{SCAN_TIME}}</p>
    </div>
    
    <div class="stats">
        <div class="stat">
            <h3>Total Pages</h3>
            <p>{{TOTAL_PAGES}}</p>
        </div>
        <div class="stat">
            <h3>Passed Checks</h3>
            <p>{{PASSED_CHECKS}}</p>
        </div>
        <div class="stat">
            <h3>Violations</h3>
            <p>{{VIOLATIONS}}</p>
        </div>
    </div>

    {{VIOLATIONS_SECTION}}
    {{PASSED_CHECKS_SECTION}}
</body>
</html>`;
  }

  private getCrawlTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LensCore Crawl Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🕷️ LensCore Crawl Results</h1>
        <p>Crawl completed at: {{CRAWL_TIME}}</p>
    </div>
    
    <h2>Discovered Pages</h2>
    {{CRAWL_TABLE_ROWS}}
</body>
</html>`;
  }

  private getTestTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LensCore Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .violations { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .passed { background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>♿ LensCore Test Results</h1>
        <p>Test completed at: {{TEST_TIME}}</p>
    </div>
    
    {{VIOLATIONS_SECTION}}
    {{PASSED_CHECKS_SECTION}}
</body>
</html>`;
  }

  private getTestMultipleTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LensCore Multiple Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .url-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>♿ LensCore Multiple Test Results</h1>
        <p>Tests completed at: {{TEST_TIME}}</p>
    </div>
    
    {{MULTIPLE_TEST_SECTIONS}}
</body>
</html>`;
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
      const composePath = await this.getDockerComposePath();
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
      const isRunning = await this.isServiceRunning();

      if (isRunning) {
        spinner.succeed('LensCore services already running');
        return;
      }

      spinner.text = 'Starting with docker-compose...';
      const composePath = await this.getDockerComposePath();
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
      const composePath = await this.getDockerComposePath();
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

      const imageExists = await this.validateImage();
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

  private async isServiceRunning(): Promise<boolean> {
    try {
      const composePath = await this.getDockerComposePath();
      const { stdout } = await execAsync(
        `LENSCORE_PORT=${this.port} docker-compose -f "${composePath}" ps --services --filter "status=running"`
      );
      return stdout.includes('lenscore') && stdout.includes('redis');
    } catch {
      return false;
    }
  }
}
