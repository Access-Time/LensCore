import { readFile, readdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';
import {
  CustomRuleConfig,
  CustomAxeRule,
  CustomPlaywrightTest,
  CustomRulesManifest,
  PlaywrightTestContext,
  CustomTestResult,
} from '../types/custom-rules';
import { PathConfig } from '../config/paths';

export class CustomRulesLoader {
  private projectRoot: string;
  private approvedRulesPath: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd();
    this.approvedRulesPath = PathConfig.getApprovedRulesPath();
  }

  async loadCustomRules(
    configPaths?: string[],
    rulePaths?: string[],
    includeApproved: boolean = true
  ): Promise<{
    axeRules: CustomAxeRule[];
    playwrightTests: CustomPlaywrightTest[];
    config: CustomRuleConfig;
  }> {
    const axeRules: CustomAxeRule[] = [];
    const playwrightTests: CustomPlaywrightTest[] = [];
    const config: CustomRuleConfig = {
      version: '1.0.0',
      axeRules: [],
      playwrightTests: [],
    };

    if (includeApproved) {
      const approved = await this.loadApprovedRules();
      axeRules.push(...approved.axeRules);
      playwrightTests.push(...approved.playwrightTests);
    }

    if (configPaths && configPaths.length > 0) {
      for (const configPath of configPaths) {
        try {
          const loaded = await this.loadConfigFile(configPath);
          if (loaded.axeRules) {
            axeRules.push(...loaded.axeRules);
          }
          if (loaded.playwrightTests) {
            const tests = await this.loadPlaywrightTests(
              loaded.playwrightTests
            );
            playwrightTests.push(...tests);
          }
          Object.assign(config, loaded);
        } catch {
          // Ignore failed config loads
        }
      }
    }

    if (rulePaths && rulePaths.length > 0) {
      for (const rulePath of rulePaths) {
        try {
          const loaded = await this.loadRulesFromDirectory(rulePath);
          axeRules.push(...loaded.axeRules);
          playwrightTests.push(...loaded.playwrightTests);
        } catch {
          // Ignore failed rule loads
        }
      }
    }

    const projectRules = await this.loadProjectRules();
    axeRules.push(...projectRules.axeRules);
    playwrightTests.push(...projectRules.playwrightTests);

    return {
      axeRules: this.deduplicateRules(axeRules),
      playwrightTests: this.deduplicateTests(playwrightTests),
      config,
    };
  }

  private async loadApprovedRules(): Promise<{
    axeRules: CustomAxeRule[];
    playwrightTests: CustomPlaywrightTest[];
  }> {
    const axeRules: CustomAxeRule[] = [];
    const playwrightTests: CustomPlaywrightTest[] = [];

    if (!existsSync(this.approvedRulesPath)) {
      return { axeRules, playwrightTests };
    }

    try {
      const manifestPath = join(this.approvedRulesPath, 'manifest.json');
      if (!existsSync(manifestPath)) {
        return { axeRules, playwrightTests };
      }

      const manifestContent = await readFile(manifestPath, 'utf-8');
      const manifest: CustomRulesManifest = JSON.parse(manifestContent);

      for (const rule of manifest.rules) {
        if (!rule.enabled) {
          continue;
        }

        const rulePath = join(this.approvedRulesPath, rule.source);

        if (!existsSync(rulePath)) {
          continue;
        }

        if (rule.type === 'axe') {
          try {
            const content = await readFile(rulePath, 'utf-8');
            const ruleData = JSON.parse(content) as CustomAxeRule;
            if (ruleData.enabled) {
              axeRules.push(ruleData);
            }
          } catch {
            // Ignore failed rule loads
          }
        } else if (rule.type === 'playwright') {
          try {
            const test = await this.loadPlaywrightTestFile(rulePath);
            if (test && test.enabled) {
              playwrightTests.push(test);
            }
          } catch {
            // Ignore failed test loads
          }
        }
      }
    } catch {
      // Ignore errors during rule loading
    }

    return { axeRules, playwrightTests };
  }

  private async loadProjectRules(): Promise<{
    axeRules: CustomAxeRule[];
    playwrightTests: CustomPlaywrightTest[];
  }> {
    const axeRules: CustomAxeRule[] = [];
    const playwrightTests: CustomPlaywrightTest[] = [];

    const possiblePaths = PathConfig.getProjectRulesPaths(this.projectRoot);

    for (const rulesPath of possiblePaths) {
      if (existsSync(rulesPath)) {
        try {
          const loaded = await this.loadRulesFromDirectory(rulesPath);
          axeRules.push(...loaded.axeRules);
          playwrightTests.push(...loaded.playwrightTests);
        } catch {
          // Ignore failed rule loads
        }
      }
    }

    return { axeRules, playwrightTests };
  }

  private async loadRulesFromDirectory(dirPath: string): Promise<{
    axeRules: CustomAxeRule[];
    playwrightTests: CustomPlaywrightTest[];
  }> {
    const axeRules: CustomAxeRule[] = [];
    const playwrightTests: CustomPlaywrightTest[] = [];

    if (!existsSync(dirPath)) {
      return { axeRules, playwrightTests };
    }

    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          const subRules = await this.loadRulesFromDirectory(fullPath);
          axeRules.push(...subRules.axeRules);
          playwrightTests.push(...subRules.playwrightTests);
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase();

          if (ext === '.json') {
            try {
              const content = await readFile(fullPath, 'utf-8');
              const data = JSON.parse(content) as
                | CustomAxeRule
                | CustomAxeRule[]
                | { axeRules?: CustomAxeRule[] };

              if (Array.isArray(data)) {
                for (const item of data) {
                  if (this.isAxeRule(item)) {
                    axeRules.push(item);
                  }
                }
              } else if (this.isAxeRule(data)) {
                axeRules.push(data);
              } else if ('axeRules' in data && Array.isArray(data.axeRules)) {
                for (const rule of data.axeRules) {
                  if (this.isAxeRule(rule)) {
                    axeRules.push(rule);
                  }
                }
              }
            } catch {
              // Ignore failed JSON parsing
            }
          } else if (ext === '.js' || ext === '.ts' || ext === '.mjs') {
            try {
              const test = await this.loadPlaywrightTestFile(fullPath);
              if (test) {
                playwrightTests.push(test);
              }
            } catch {
              // Ignore failed test loads
            }
          }
        }
      }
    } catch {
      // Ignore directory read errors
    }

    return { axeRules, playwrightTests };
  }

  private async loadConfigFile(
    configPath: string
  ): Promise<Partial<CustomRuleConfig>> {
    if (!existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    const ext = extname(configPath).toLowerCase();
    const content = await readFile(configPath, 'utf-8');

    if (ext === '.json') {
      return JSON.parse(content) as Partial<CustomRuleConfig>;
    } else if (ext === '.yaml' || ext === '.yml') {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - yaml is an optional dependency
        const yamlModule = (await import('yaml').catch(() => null)) as {
          default?: { parse: (content: string) => unknown };
          parse?: (content: string) => unknown;
        } | null;
        if (!yamlModule) {
          throw new Error(
            `YAML parsing requires 'yaml' package. Install it with: npm install yaml`
          );
        }
        const yaml = yamlModule.default || yamlModule;
        const parseFn =
          (yaml as { parse?: (content: string) => unknown }).parse ||
          (yamlModule as { parse?: (content: string) => unknown }).parse;
        if (typeof parseFn !== 'function') {
          throw new Error('yaml.parse is not a function');
        }
        return parseFn(content) as Partial<CustomRuleConfig>;
      } catch (error) {
        if (error instanceof Error && error.message.includes('yaml')) {
          throw error;
        }
        throw new Error(
          `Failed to parse YAML file: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    } else if (ext === '.js' || ext === '.mjs') {
      const module = await import(configPath);
      const config = (module.default ||
        (module as { exports?: unknown }).exports ||
        module) as Partial<CustomRuleConfig>;
      return config;
    }

    throw new Error(`Unsupported config file format: ${ext}`);
  }

  private async loadPlaywrightTests(
    testPaths: string[]
  ): Promise<CustomPlaywrightTest[]> {
    const tests: CustomPlaywrightTest[] = [];

    for (const testPath of testPaths) {
      try {
        const test = await this.loadPlaywrightTestFile(testPath);
        if (test) {
          tests.push(test);
        }
      } catch {
        // Ignore failed test loads
      }
    }

    return tests;
  }

  private async loadPlaywrightTestFile(
    filePath: string
  ): Promise<CustomPlaywrightTest | null> {
    if (!existsSync(filePath)) {
      return null;
    }

    try {
      const pathModule = await import('path');
      const urlModule = await import('url');
      const resolvedPath = pathModule.default.isAbsolute(filePath)
        ? filePath
        : pathModule.default.resolve(filePath);

      let module: { default?: unknown; [key: string]: unknown };
      const ext = extname(resolvedPath);

      if (ext === '.mjs') {
        try {
          const fileUrl = urlModule.pathToFileURL(resolvedPath).href;
          module = await import(fileUrl);
        } catch {
          try {
            module = await import(resolvedPath);
          } catch {
            const absolutePath = pathModule.default.resolve(resolvedPath);
            const fileUrl2 = urlModule.pathToFileURL(absolutePath).toString();
            module = await import(fileUrl2);
          }
        }
      } else {
        try {
          const fileUrl = urlModule.pathToFileURL(resolvedPath).href;
          module = await import(fileUrl);
        } catch {
          module = await import(resolvedPath);
        }
      }

      const test = (module.default ||
        (module as { exports?: unknown }).exports ||
        module) as
        | ((context: PlaywrightTestContext) => Promise<CustomTestResult>)
        | CustomPlaywrightTest;

      if (typeof test === 'function') {
        return {
          id: basename(filePath, extname(filePath)),
          name: test.name || basename(filePath, extname(filePath)),
          enabled: true,
          severity: 'moderate',
          run: test,
        };
      } else if (
        test &&
        typeof test === 'object' &&
        'run' in test &&
        typeof test.run === 'function'
      ) {
        const customTest = test as CustomPlaywrightTest;
        return {
          id: customTest.id || basename(filePath, extname(filePath)),
          name:
            customTest.name ||
            customTest.id ||
            basename(filePath, extname(filePath)),
          description: customTest.description,
          enabled: customTest.enabled !== false,
          severity: customTest.severity || 'moderate',
          run: customTest.run,
        };
      }
    } catch {
      // Ignore import errors
    }

    return null;
  }

  private isAxeRule(obj: unknown): obj is CustomAxeRule {
    if (obj === null || typeof obj !== 'object') {
      return false;
    }
    const record = obj as Record<string, unknown>;
    return (
      'id' in record &&
      typeof record['id'] === 'string' &&
      'enabled' in record &&
      typeof record['enabled'] === 'boolean'
    );
  }

  private deduplicateRules(rules: CustomAxeRule[]): CustomAxeRule[] {
    const seen = new Map<string, CustomAxeRule>();

    for (const rule of rules) {
      if (rule.enabled) {
        const existing = seen.get(rule.id);
        if (!existing) {
          seen.set(rule.id, rule);
        }
      }
    }

    return Array.from(seen.values());
  }

  private deduplicateTests(
    tests: CustomPlaywrightTest[]
  ): CustomPlaywrightTest[] {
    const seen = new Map<string, CustomPlaywrightTest>();

    for (const test of tests) {
      if (test.enabled) {
        const existing = seen.get(test.id);
        if (!existing) {
          seen.set(test.id, test);
        }
      }
    }

    return Array.from(seen.values());
  }

  async validateRules(rules: {
    axeRules: CustomAxeRule[];
    playwrightTests: CustomPlaywrightTest[];
  }): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const rule of rules.axeRules) {
      if (!rule.id) {
        errors.push(`Axe rule missing id`);
      }
      if (rule.rule && !rule.rule.id) {
        errors.push(`Axe rule ${rule.id} missing rule.id`);
      }
    }

    for (const test of rules.playwrightTests) {
      if (!test.id) {
        errors.push(`Playwright test missing id`);
      }
      if (typeof test.run !== 'function') {
        errors.push(`Playwright test ${test.id} missing run function`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
