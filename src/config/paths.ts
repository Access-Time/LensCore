import { join, dirname, resolve } from 'path';
import { existsSync } from 'fs';
import os from 'os';

declare const __dirname: string;

function resolvePackage(packageName: string): string | null {
  try {
    return require.resolve(packageName);
  } catch {
    return null;
  }
}

export class PathConfig {
  private static readonly LENSCORE_DIR_NAME = '.lenscore';
  private static readonly APPROVED_RULES_DIR = 'approved-rules';
  private static readonly RULES_DIR = 'rules';
  private static readonly WEB_DIR = 'web';
  private static readonly STORAGE_DIR = 'storage';
  private static readonly TEMPLATES_DIR = 'templates';
  private static readonly OUTPUT_DIR = 'output';
  private static readonly STYLES_DIR = 'styles';
  private static readonly SCREENSHOTS_DIR = 'screenshots';

  static getLenscoreHomeDir(): string {
    return join(os.homedir(), this.LENSCORE_DIR_NAME);
  }

  static getLenscoreProjectDir(projectRoot: string): string {
    return join(projectRoot, this.LENSCORE_DIR_NAME);
  }

  static getApprovedRulesPath(): string {
    const currentDir =
      typeof __dirname !== 'undefined' ? __dirname : process.cwd();

    const possiblePaths = [
      join(currentDir, '..', 'data', this.APPROVED_RULES_DIR),
      join(currentDir, '..', '..', 'dist', 'data', this.APPROVED_RULES_DIR),
      join(process.cwd(), 'dist', 'data', this.APPROVED_RULES_DIR),
      join(process.cwd(), 'src', 'data', this.APPROVED_RULES_DIR),
    ];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    return possiblePaths[0]!;
  }

  static getProjectRulesPaths(projectRoot: string): string[] {
    return [
      join(projectRoot, this.LENSCORE_DIR_NAME, this.RULES_DIR),
      join(projectRoot, 'lenscore-rules'),
      join(projectRoot, `.${this.LENSCORE_DIR_NAME}-rules`),
    ];
  }

  static getConfigPath(): string {
    return join(this.getLenscoreHomeDir(), 'config.json');
  }

  static getWebTemplatesPaths(): string[] {
    const paths = [join(process.cwd(), this.WEB_DIR, this.TEMPLATES_DIR)];

    const currentDir =
      typeof __dirname !== 'undefined' ? __dirname : process.cwd();
    if (currentDir !== process.cwd()) {
      paths.push(
        join(currentDir, '../../../../', this.WEB_DIR, this.TEMPLATES_DIR)
      );
    }

    paths.push(
      join(
        this.getLenscoreProjectDir(process.cwd()),
        this.WEB_DIR,
        this.TEMPLATES_DIR
      ),
      join(this.getLenscoreHomeDir(), this.WEB_DIR, this.TEMPLATES_DIR)
    );

    const packagePath = resolvePackage('@accesstime/lenscore');
    if (packagePath) {
      const packageDir = dirname(packagePath);
      paths.unshift(
        join(packageDir, this.WEB_DIR, this.TEMPLATES_DIR),
        join(packageDir, `../${this.WEB_DIR}/${this.TEMPLATES_DIR}`)
      );
    }

    return paths;
  }

  static getWebOutputPaths(): string[] {
    const paths = [
      join('/app', this.LENSCORE_DIR_NAME, this.WEB_DIR, this.OUTPUT_DIR),
      join('/app', this.WEB_DIR, this.OUTPUT_DIR),
      join(this.getLenscoreHomeDir(), this.WEB_DIR, this.OUTPUT_DIR),
      join(
        this.getLenscoreProjectDir(process.cwd()),
        this.WEB_DIR,
        this.OUTPUT_DIR
      ),
      join(process.cwd(), this.WEB_DIR, this.OUTPUT_DIR),
    ];

    const packagePath = resolvePackage('@accesstime/lenscore');
    if (packagePath) {
      const packageDir = dirname(packagePath);
      paths.unshift(join(packageDir, this.WEB_DIR, this.OUTPUT_DIR));
    }

    return paths;
  }

  static getWebStylesPaths(): string[] {
    const paths = [
      join('/app', this.LENSCORE_DIR_NAME, this.WEB_DIR, this.STYLES_DIR),
      join('/app', this.WEB_DIR, this.STYLES_DIR),
      join(process.cwd(), this.WEB_DIR, this.STYLES_DIR),
    ];

    const currentDir =
      typeof __dirname !== 'undefined' ? __dirname : process.cwd();
    if (currentDir !== process.cwd()) {
      paths.push(
        join(currentDir, '../../../../', this.WEB_DIR, this.STYLES_DIR)
      );
    }

    paths.push(
      join(this.getLenscoreHomeDir(), this.WEB_DIR, this.STYLES_DIR),
      join(
        this.getLenscoreProjectDir(process.cwd()),
        this.WEB_DIR,
        this.STYLES_DIR
      )
    );

    const packagePath = resolvePackage('@accesstime/lenscore');
    if (packagePath) {
      const packageDir = dirname(packagePath);
      paths.unshift(
        join(packageDir, this.WEB_DIR, this.STYLES_DIR),
        join(packageDir, `../${this.WEB_DIR}/${this.STYLES_DIR}`)
      );
    }

    return paths;
  }

  static getScreenshotsPaths(storagePath?: string): string[] {
    const paths = [
      join(this.getLenscoreHomeDir(), this.STORAGE_DIR, this.SCREENSHOTS_DIR),
      join(
        this.getLenscoreProjectDir(process.cwd()),
        this.STORAGE_DIR,
        this.SCREENSHOTS_DIR
      ),
      join(process.cwd(), this.STORAGE_DIR, this.SCREENSHOTS_DIR),
      join('/app', this.STORAGE_DIR, this.SCREENSHOTS_DIR),
    ];

    if (storagePath) {
      paths.unshift(join(resolve(storagePath), this.SCREENSHOTS_DIR));
      paths.push(
        join(resolve(storagePath || './storage'), this.SCREENSHOTS_DIR)
      );
    }

    return paths.filter((p): p is string => p !== null);
  }

  static getDockerComposePaths(): string[] {
    const paths = [join(process.cwd(), 'docker-compose.yml')];

    const packagePath = resolvePackage('@accesstime/lenscore');
    if (packagePath) {
      const packageDir = dirname(packagePath);
      paths.push(join(packageDir, 'docker-compose.yml'));
    }

    paths.push(join(this.getLenscoreHomeDir(), 'docker-compose.yml'));

    return paths;
  }
}
