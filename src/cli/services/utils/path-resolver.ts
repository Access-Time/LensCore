/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import os from 'os';

export class PathResolverService {
  static findTemplatesDirectory(): string {
    const possiblePaths = [
      path.join(
        path.dirname(require.resolve('@accesstime/lenscore')),
        'web',
        'templates'
      ),
      path.join(process.cwd(), 'web', 'templates'),
      path.join(os.homedir(), '.lenscore', 'web', 'templates'),
      path.join(process.cwd(), '.lenscore', 'web', 'templates'),
      path.join(__dirname, '../../../../web/templates'),
      path.join(
        path.dirname(require.resolve('@accesstime/lenscore')),
        '../web/templates'
      ),
    ];

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
    const possiblePaths = [
      path.join(os.homedir(), '.lenscore', 'web', 'output'),
      path.join(process.cwd(), '.lenscore', 'web', 'output'),
      path.join(process.cwd(), 'web', 'output'),
      path.join(
        path.dirname(require.resolve('@accesstime/lenscore')),
        'web',
        'output'
      ),
    ];

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
}
