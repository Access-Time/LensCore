/* eslint-disable no-console */
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export async function configCommand(options: any) {
  const configPath = path.join(os.homedir(), '.lenscore', 'config.json');

  try {
    let config: any = {};

    try {
      const configData = await fs.readFile(configPath, 'utf8');
      config = JSON.parse(configData);
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
      let current = config;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.green(`✅ Set ${key} = ${value}`));
    } else if (options.get) {
      const keys = options.get.split('.');
      let value = config;

      for (const key of keys) {
        value = value[key];
        if (value === undefined) {
          console.log(chalk.red(`Key "${options.get}" not found`));
          return;
        }
      }

      console.log(chalk.blue(`${options.get}: ${value}`));
    } else if (options.list) {
      console.log(chalk.blue.bold('\n📋 Current Configuration:'));
      console.log(chalk.gray(JSON.stringify(config, null, 2)));
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
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
