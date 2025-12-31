/* eslint-disable no-console */
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

type ConfigValue = string | number | boolean | null | undefined;

interface ConfigObject {
  [key: string]: ConfigValue | ConfigObject | ConfigValue[];
}

interface MaskedConfig {
  [key: string]: string | ConfigValue | MaskedConfig | ConfigValue[];
}

interface ConfigOptions {
  set?: string;
  get?: string;
  list?: boolean;
}

const SECRET_KEYS = ["apikey", "apiKey"];

function maskSensitiveValue(key: string, value: ConfigValue): string | ConfigValue {
  const keyLower = key.toLowerCase();
  
  if (SECRET_KEYS.some(sk => keyLower.includes(sk))) {
    if (typeof value === 'string' && value.length > 0) {
      if (value.length <= 8) {
        return '***';
      }
      return `${value.substring(0, 4)}${'*'.repeat(Math.min(value.length - 8, 20))}${value.substring(value.length - 4)}`;
    }
    return '***';
  }
  return value;
}

function maskConfig(config: ConfigObject | null): MaskedConfig | null {
  if (typeof config !== 'object' || config === null) {
    return null;
  }
  
  if (Array.isArray(config)) {
    return config.map(item => maskConfig(item as ConfigObject)) as unknown as MaskedConfig;
  }
  
  const masked: MaskedConfig = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      masked[key] = maskConfig(value as ConfigObject);
    } else {
      masked[key] = maskSensitiveValue(key, value as ConfigValue);
    }
  }
  return masked;
}

export async function configCommand(options: ConfigOptions): Promise<void> {
  const configPath = path.join(os.homedir(), '.lenscore', 'config.json');

  try {
    let config: ConfigObject = {};

    try {
      const configData = await fs.readFile(configPath, 'utf8');
      const parsed = JSON.parse(configData) as ConfigObject;
      config = parsed;
    } catch {
      console.log(
        chalk.yellow('No configuration found. Run "lens-core setup" first.')
      );
      return;
    }

    if (options.set) {
      const [key, value] = options.set.split('=');
      if (!key || !value) {
        console.log(chalk.red('Invalid format. Use: key=value'));
        return;
      }

      const keys = key.split('.');
      let current: ConfigObject = config;

      for (let i = 0; i < keys.length - 1; i++) {
        const currentKey = keys[i];
        if (!currentKey) {
          console.log(chalk.red('Invalid format. Use: key=value'));
          return;
        }
        if (!current[currentKey]) {
          current[currentKey] = {};
        }
        current = current[currentKey] as ConfigObject;
      }

      const lastKey = keys[keys.length - 1];
      if (!lastKey) {
        console.log(chalk.red('Invalid format. Use: key=value'));
        return;
      }
      current[lastKey] = value;

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      const displayValue = maskSensitiveValue(lastKey, value);
      console.log(chalk.green(`✅ Set ${key} = ${displayValue}`));
    } else if (options.get) {
      const keys = options.get.split('.');
      let current: ConfigValue | ConfigObject | ConfigValue[] = config;

      for (const key of keys) {
        if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
          current = (current as ConfigObject)[key];
          if (current === undefined) {
            console.log(chalk.red(`Key "${options.get}" not found`));
            return;
          }
        } else {
          console.log(chalk.red(`Key "${options.get}" not found`));
          return;
        }
      }

      const lastKey = keys[keys.length - 1];
      if (!lastKey) {
        console.log(chalk.red(`Key "${options.get}" not found`));
        return;
      }
      const displayValue = maskSensitiveValue(lastKey, current as ConfigValue);
      console.log(chalk.blue(`${options.get}: ${displayValue}`));
    } else if (options.list) {
      console.log(chalk.blue.bold('\n📋 Current Configuration:'));
      const maskedConfig = maskConfig(config);
      console.log(chalk.gray(JSON.stringify(maskedConfig, null, 2)));
    } else {
      console.log(chalk.blue.bold('\n📋 Configuration Management:'));
      console.log(chalk.gray('• lens-core config --list (show all config)'));
      console.log(
        chalk.gray('• lens-core config --get <key> (get specific value)')
      );
      console.log(
        chalk.gray('• lens-core config --set <key=value> (set value)')
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(chalk.red('Error:'), errorMessage);
    process.exit(1);
  }
}
