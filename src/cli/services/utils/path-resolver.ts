/* eslint-disable no-console */
import fs from 'fs';
import { dirname } from 'path';
import { PathConfig } from '../../../config/paths';

export class PathResolverService {
  static findTemplatesDirectory(): string {
    const possiblePaths = PathConfig.getWebTemplatesPaths();
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

    throw new Error('No template directory found');
  }

  static findOutputDirectory(): string {
    const possiblePaths = PathConfig.getWebOutputPaths();
    const foundPath = possiblePaths.find((p) => {
      try {
        return fs.existsSync(dirname(p));
      } catch {
        return false;
      }
    });

    const outputDir = foundPath || possiblePaths[0]!;
    console.log(`📁 Using output directory: ${outputDir}`);
    return outputDir;
  }

  static findStylesDirectory(): string {
    const possiblePaths = PathConfig.getWebStylesPaths();
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

    throw new Error('No styles directory found');
  }
}
