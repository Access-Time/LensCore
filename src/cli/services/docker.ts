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

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache \\
  chromium \\
  nss \\
  freetype \\
  freetype-dev \\
  harfbuzz \\
  ca-certificates \\
  ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \\
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \\
  NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN mkdir -p logs storage

EXPOSE 3001

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
        const currentFile = __filename;
        const packageDir = path.resolve(currentFile, '../../../../');

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

        const srcDir = path.join(packageDir, 'src');
        const destSrcDir = path.join(lenscoreDir, 'src');
        try {
          await fs.access(srcDir);
          await this.copyDirectory(srcDir, destSrcDir);
        } catch {
          // Skip if directory not found
        }
      } catch {
        // Skip if package path not found
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
