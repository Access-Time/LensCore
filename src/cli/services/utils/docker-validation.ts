import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class DockerValidationService {
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

  async validatePort(port: number): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`lsof -i :${port}`);
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

  async isServiceRunning(port: number, composePath: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `LENSCORE_PORT=${port} docker-compose -f "${composePath}" ps --services --filter "status=running"`
      );
      return stdout.includes('lenscore') && stdout.includes('redis');
    } catch {
      return false;
    }
  }
}
