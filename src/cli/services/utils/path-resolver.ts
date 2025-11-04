/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import os from 'os';

export class PathResolverService {
  static findTemplatesDirectory(): string {
    const possiblePaths: string[] = [
      path.join(process.cwd(), 'web', 'templates'),
      path.join(__dirname, '../../../../web/templates'),
      path.join(os.homedir(), '.lenscore', 'web', 'templates'),
      path.join(process.cwd(), '.lenscore', 'web', 'templates'),
    ];

    // Try to add global install paths if available
    try {
      const packagePath = require.resolve('@accesstime/lenscore');
      const packageDir = path.dirname(packagePath);
      possiblePaths.unshift(
        path.join(packageDir, 'web', 'templates'),
        path.join(packageDir, '../web/templates')
      );
    } catch {
      // Package not found, skip this path (development mode)
    }

    const foundPath = possiblePaths.find((p) => {
      try {
        return fs.existsSync(p) && fs.statSync(p).isDirectory();
      } catch {
        return false;
      }
    });

    if (foundPath) {
      console.log(`📁 Using templates from: ${foundPath}`);
      return foundPath;
    }

    console.warn(
      '⚠️  No template directory found, creating fallback templates'
    );
    const fallbackPath = path.join(
      os.homedir(),
      '.lenscore',
      'web',
      'templates'
    );
    return fallbackPath;
  }

  static findOutputDirectory(): string {
    const possiblePaths: string[] = [
      path.join(os.homedir(), '.lenscore', 'web', 'output'),
      path.join(process.cwd(), '.lenscore', 'web', 'output'),
      path.join(process.cwd(), 'web', 'output'),
    ];

    // Try to add global install path if available
    try {
      const packagePath = require.resolve('@accesstime/lenscore');
      const packageDir = path.dirname(packagePath);
      possiblePaths.unshift(path.join(packageDir, 'web', 'output'));
    } catch {
      // Package not found, skip this path (development mode)
    }

    const foundPath = possiblePaths.find((p) => {
      try {
        return fs.existsSync(path.dirname(p));
      } catch {
        return false;
      }
    });

    const outputDir = foundPath || possiblePaths[0]!;
    console.log(`📁 Using output directory: ${outputDir}`);
    return outputDir;
  }

  static findStylesDirectory(): string {
    const possiblePaths: string[] = [
      path.join(process.cwd(), 'web', 'styles'),
      path.join(__dirname, '../../../../web/styles'),
      path.join(os.homedir(), '.lenscore', 'web', 'styles'),
      path.join(process.cwd(), '.lenscore', 'web', 'styles'),
    ];

    // Try to add global install paths if available
    try {
      const packagePath = require.resolve('@accesstime/lenscore');
      const packageDir = path.dirname(packagePath);
      possiblePaths.unshift(
        path.join(packageDir, 'web', 'styles'),
        path.join(packageDir, '../web/styles')
      );
    } catch {
      // Package not found, skip this path (development mode)
    }

    const foundPath = possiblePaths.find((p) => {
      try {
        return fs.existsSync(p) && fs.statSync(p).isDirectory();
      } catch {
        return false;
      }
    });

    if (foundPath) {
      return foundPath;
    }

    const fallbackPath = path.join(os.homedir(), '.lenscore', 'web', 'styles');
    return fallbackPath;
  }
}
