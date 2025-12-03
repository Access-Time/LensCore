/* eslint-disable no-console */
import { join, dirname, resolve } from 'path';
import { promises as fs } from 'fs';
import { PathConfig } from '../../../config/paths';

export class DockerConfigService {
  private dockerComposePath: string | null = null;

  async getDockerComposePath(): Promise<string> {
    if (this.dockerComposePath) {
      return this.dockerComposePath;
    }

    const possiblePaths = PathConfig.getDockerComposePaths();

    for (const composePath of possiblePaths) {
      try {
        await fs.access(composePath);
        this.dockerComposePath = composePath;
        return this.dockerComposePath;
      } catch {
        continue;
      }
    }

    const lenscoreDir = PathConfig.getLenscoreHomeDir();
    const composePath = join(lenscoreDir, 'docker-compose.yml');

    await fs.mkdir(lenscoreDir, { recursive: true });
    await this.createDockerFiles(lenscoreDir);
    await this.setupPackageFiles(lenscoreDir);

    this.dockerComposePath = composePath;
    return this.dockerComposePath;
  }

  private async createDockerFiles(lenscoreDir: string): Promise<void> {
    const composePath = join(lenscoreDir, 'docker-compose.yml');
    const dockerfilePath = join(lenscoreDir, 'Dockerfile');

    const possiblePackageDirs: string[] = [
      process.cwd(),
      resolve(__filename, '../../../../'),
    ];

    try {
      const packagePath = require.resolve('@accesstime/lenscore');
      possiblePackageDirs.push(
        resolve(packagePath, '../..'),
        dirname(packagePath)
      );
    } catch {
      //
    }

    let dockerFilesCopied = false;
    for (const packageDir of possiblePackageDirs) {
      try {
        const srcComposePath = join(packageDir, 'docker-compose.yml');
        const srcDockerfilePath = join(packageDir, 'Dockerfile');

        await fs.access(srcComposePath);
        await fs.access(srcDockerfilePath);

        await fs.copyFile(srcComposePath, composePath);
        await fs.copyFile(srcDockerfilePath, dockerfilePath);

        console.log(`✅ Copied Docker files from ${packageDir}`);
        dockerFilesCopied = true;
        break;
      } catch {
        //
      }
    }

    if (!dockerFilesCopied) {
      throw new Error(
        'Could not find Dockerfile or docker-compose.yml in package directory. Please ensure the package is properly installed.'
      );
    }
  }

  private async setupPackageFiles(lenscoreDir: string): Promise<void> {
    const packageJsonPath = join(lenscoreDir, 'package.json');
    const possiblePackageDirs: string[] = [
      process.cwd(),
      resolve(__filename, '../../../../'),
    ];

    try {
      const packagePath = require.resolve('@accesstime/lenscore');
      possiblePackageDirs.push(
        resolve(packagePath, '../..'),
        dirname(packagePath)
      );
    } catch {
      //
    }

    let packageDirFound = false;
    for (const packageDir of possiblePackageDirs) {
      try {
        const srcPackageJsonPath = join(packageDir, 'package.json');
        await fs.access(srcPackageJsonPath);

        await fs.copyFile(srcPackageJsonPath, packageJsonPath);
        console.log(`✅ Copied package.json from ${packageDir}`);

        await this.copyConfigFiles(packageDir, lenscoreDir);
        await this.copySourceFiles(packageDir, lenscoreDir);
        await this.copyWebTemplates(packageDir, lenscoreDir);
        packageDirFound = true;
        break;
      } catch {
        //
      }
    }

    if (!packageDirFound) {
      throw new Error(
        'Could not find package.json in package directory. Please ensure the package is properly installed.'
      );
    }
  }

  private async copyConfigFiles(
    packageDir: string,
    lenscoreDir: string
  ): Promise<void> {
    const tsconfigFiles = ['tsconfig.json', 'tsconfig.cli.json'];
    for (const tsconfigFile of tsconfigFiles) {
      try {
        const srcPath = join(packageDir, tsconfigFile);
        const destPath = join(lenscoreDir, tsconfigFile);
        await fs.access(srcPath);
        await fs.copyFile(srcPath, destPath);
      } catch {
        //
      }
    }

    const packageLockDest = join(lenscoreDir, 'package-lock.json');

    for (const possibleDir of [
      packageDir,
      process.cwd(),
      resolve(__filename, '../../../../'),
    ]) {
      try {
        const packageLockSrc = join(possibleDir, 'package-lock.json');
        await fs.access(packageLockSrc);
        await fs.copyFile(packageLockSrc, packageLockDest);
        console.log(`✅ Copied package-lock.json from ${possibleDir}`);
      } catch {
        //
      }
    }
  }

  private async copySourceFiles(
    packageDir: string,
    lenscoreDir: string
  ): Promise<void> {
    const srcDir = join(packageDir, 'src');
    const destSrcDir = join(lenscoreDir, 'src');
    try {
      await fs.access(srcDir);
      await this.copyDirectory(srcDir, destSrcDir);
    } catch {
      //
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async copyWebTemplates(
    packageDir: string,
    lenscoreDir: string
  ): Promise<void> {
    const webDir = join(packageDir, 'web');
    const destWebDir = join(lenscoreDir, 'web');

    try {
      await fs.access(webDir);
      await this.copyDirectory(webDir, destWebDir);
      console.log(`✅ Copied web templates from ${webDir} to ${destWebDir}`);

      const stylesDir = join(destWebDir, 'styles');
      const stylesSource = join(webDir, 'styles');
      const reportCssPath = join(stylesDir, 'report.css');

      if (!(await this.fileExists(reportCssPath))) {
        if (await this.fileExists(stylesSource)) {
          await fs.mkdir(stylesDir, { recursive: true });
          await this.copyDirectory(stylesSource, stylesDir);
          console.log(
            `✅ Copied web styles from ${stylesSource} to ${stylesDir}`
          );
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not copy web templates: ${error}`);
    }

    const outputDir = join(destWebDir, 'output');
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
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}
