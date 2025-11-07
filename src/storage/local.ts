import fs from 'fs/promises';
import path from 'path';
import { env } from '../utils/env';
import logger from '../utils/logger';
import { StorageService } from './types';

export class LocalStorageService implements StorageService {
  private basePath: string;

  constructor(basePath: string = env.STORAGE_PATH) {
    this.basePath = path.resolve(basePath);
  }

  async uploadFile(filePath: string, key: string): Promise<string> {
    try {
      const targetPath = path.join(this.basePath, key);
      const targetDir = path.dirname(targetPath);

      await fs.mkdir(targetDir, {
        recursive: true,
      });

      await fs.copyFile(filePath, targetPath);

      const fileStats = await fs.stat(targetPath);
      if (fileStats.size === 0) {
        throw new Error(`Uploaded file is empty: ${targetPath}`);
      }

      logger.info('File uploaded successfully', {
        source: filePath,
        target: targetPath,
        size: fileStats.size,
      });

      return targetPath;
    } catch (error) {
      logger.error('Failed to upload file to local storage', {
        error,
        key,
        basePath: this.basePath,
        sourcePath: filePath,
      });
      throw error;
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      return await fs.readFile(path.join(this.basePath, key));
    } catch (error) {
      logger.error('Failed to download file from local storage', {
        error,
        key,
      });
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.basePath, key));
    } catch (error) {
      logger.error('Failed to delete file from local storage', { error, key });
      throw error;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    return path.join(this.basePath, key);
  }

  async cleanup(): Promise<void> {
    return Promise.resolve();
  }
}
