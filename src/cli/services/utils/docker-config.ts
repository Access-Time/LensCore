/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';

export class DockerConfigService {
  private dockerComposePath: string | null = null;

  async getDockerComposePath(): Promise<string> {
    if (this.dockerComposePath) {
      return this.dockerComposePath;
    }

    const currentDirPath = path.join(process.cwd(), 'docker-compose.yml');
    try {
      await fs.access(currentDirPath);
      this.dockerComposePath = currentDirPath;
      return this.dockerComposePath;
    } catch {
      //
    }

    try {
      const packagePath = require.resolve('@accesstime/lenscore');
      const packageDir = path.dirname(packagePath);
      const packageComposePath = path.join(packageDir, 'docker-compose.yml');

      await fs.access(packageComposePath);
      this.dockerComposePath = packageComposePath;
      return this.dockerComposePath;
    } catch {
      //
    }

    const homeDir = os.homedir();
    const lenscoreDir = path.join(homeDir, '.lenscore');
    const composePath = path.join(lenscoreDir, 'docker-compose.yml');

    await fs.mkdir(lenscoreDir, { recursive: true });
    await this.createDockerFiles(lenscoreDir);
    await this.setupPackageFiles(lenscoreDir);

    this.dockerComposePath = composePath;
    return this.dockerComposePath;
  }

  private async createDockerFiles(lenscoreDir: string): Promise<void> {
    const composePath = path.join(lenscoreDir, 'docker-compose.yml');
    const dockerfilePath = path.join(lenscoreDir, 'Dockerfile');

    const dockerComposeContent = this.getDockerComposeContent();
    const dockerfileContent = this.getDockerfileContent();

    await fs.writeFile(composePath, dockerComposeContent);
    await fs.writeFile(dockerfilePath, dockerfileContent);
  }

  private getDockerComposeContent(): string {
    return `services:
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
  }

  private getDockerfileContent(): string {
    return `FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

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
RUN npm install --production

COPY --from=builder /app/dist ./dist

RUN mkdir -p logs storage

EXPOSE 3001

CMD ["npm", "start"]`;
  }

  private async setupPackageFiles(lenscoreDir: string): Promise<void> {
    const packageJsonPath = path.join(lenscoreDir, 'package.json');
    const packageJsonContent = await this.getPackageJsonContent();

    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJsonContent, null, 2)
    );

    try {
      const packageDir = await this.findPackageDirectory();
      await this.copyConfigFiles(packageDir, lenscoreDir);
      await this.copySourceFiles(packageDir, lenscoreDir);
      await this.copyWebTemplates(packageDir, lenscoreDir);
    } catch (error) {
      console.warn(`⚠️  Package setup warning: ${error}`);
      await this.createFallbackTemplates(path.join(lenscoreDir, 'web'));
    }
  }

  private async getPackageJsonContent(): Promise<any> {
    try {
      const currentFile = __filename;
      const packageDir = path.resolve(currentFile, '../../../../');
      const originalPackageJsonPath = path.join(packageDir, 'package.json');
      const originalPackageJson = await fs.readFile(
        originalPackageJsonPath,
        'utf8'
      );
      const packageJsonContent = JSON.parse(originalPackageJson);

      packageJsonContent.scripts = {
        start: 'node dist/index.js',
        build: 'tsc',
        'build:cli': 'tsc -p tsconfig.cli.json',
      };

      return packageJsonContent;
    } catch {
      return this.getDefaultPackageJson();
    }
  }

  private getDefaultPackageJson(): any {
    return {
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
        '@types/inquirer': '^9.0.9',
        '@types/ioredis': '^4.28.10',
        'aws-sdk': '^2.1490.0',
        'axe-core': '^4.8.2',
        chalk: '^4.1.2',
        cheerio: '^1.0.0',
        commander: '^11.1.0',
        cors: '^2.8.5',
        dotenv: '^16.3.1',
        express: '^4.18.2',
        handlebars: '^4.7.8',
        helmet: '^7.1.0',
        inquirer: '^12.10.0',
        ioredis: '^5.8.1',
        marked: '^16.4.1',
        openai: '^6.5.0',
        ora: '^5.4.1',
        puppeteer: '^24.15.0',
        sharp: '^0.33.0',
        uuid: '^9.0.1',
        winston: '^3.11.0',
        zod: '^3.22.4',
      },
      devDependencies: {
        '@types/cors': '^2.8.17',
        '@types/express': '^4.17.21',
        '@types/handlebars': '^4.0.40',
        '@types/jest': '^29.5.8',
        '@types/marked': '^5.0.2',
        '@types/multer': '^1.4.11',
        '@types/node': '^20.10.5',
        '@types/supertest': '^2.0.16',
        '@types/uuid': '^9.0.8',
        '@typescript-eslint/eslint-plugin': '^8.15.0',
        '@typescript-eslint/parser': '^8.15.0',
        eslint: '^9.15.0',
        globals: '^13.24.0',
        jest: '^29.7.0',
        nodemon: '^3.0.2',
        prettier: '^3.1.1',
        supertest: '^7.1.3',
        'ts-jest': '^29.1.1',
        tsx: '^4.6.2',
        typescript: '^5.3.3',
      },
    };
  }

  private async findPackageDirectory(): Promise<string> {
    const possiblePackageDirs = [
      path.resolve(__filename, '../../../../'),
      path.resolve(require.resolve('@accesstime/lenscore'), '../..'),
      path.dirname(require.resolve('@accesstime/lenscore')),
    ];

    for (const dir of possiblePackageDirs) {
      try {
        const packageJsonPath = path.join(dir, 'package.json');
        await fs.access(packageJsonPath);
        return dir;
      } catch {
        //
      }
    }

    throw new Error('Could not find package directory');
  }

  private async copyConfigFiles(
    packageDir: string,
    lenscoreDir: string
  ): Promise<void> {
    const tsconfigFiles = ['tsconfig.json', 'tsconfig.cli.json'];
    for (const tsconfigFile of tsconfigFiles) {
      try {
        const srcPath = path.join(packageDir, tsconfigFile);
        const destPath = path.join(lenscoreDir, tsconfigFile);
        await fs.copyFile(srcPath, destPath);
      } catch {
        //
      }
    }

    try {
      const packageLockSrc = path.join(packageDir, 'package-lock.json');
      const packageLockDest = path.join(lenscoreDir, 'package-lock.json');
      await fs.copyFile(packageLockSrc, packageLockDest);
    } catch {
      //
    }
  }

  private async copySourceFiles(
    packageDir: string,
    lenscoreDir: string
  ): Promise<void> {
    const srcDir = path.join(packageDir, 'src');
    const destSrcDir = path.join(lenscoreDir, 'src');
    try {
      await fs.access(srcDir);
      await this.copyDirectory(srcDir, destSrcDir);
    } catch {
      //
    }
  }

  private async copyWebTemplates(
    packageDir: string,
    lenscoreDir: string
  ): Promise<void> {
    const webDir = path.join(packageDir, 'web');
    const destWebDir = path.join(lenscoreDir, 'web');
    try {
      await fs.access(webDir);
      await this.copyDirectory(webDir, destWebDir);
      console.log(`✅ Copied web templates from ${webDir} to ${destWebDir}`);
    } catch (error) {
      console.warn(`⚠️  Could not copy web templates: ${error}`);
      await this.createFallbackTemplates(destWebDir);
    }

    const outputDir = path.join(destWebDir, 'output');
    try {
      await fs.mkdir(outputDir, { recursive: true });
      console.log(`✅ Created output directory: ${outputDir}`);
    } catch (error) {
      console.warn(`⚠️  Could not create output directory: ${error}`);
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
}
