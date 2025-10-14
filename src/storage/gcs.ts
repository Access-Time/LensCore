import { Storage } from '@google-cloud/storage';
import { env } from '../utils/env';
import logger from '../utils/logger';
import { StorageService } from './types';

export class GCSStorageService implements StorageService {
  private storage: Storage;
  private bucket: string;

  constructor() {
    if (!env.GCS_PROJECT_ID || !env.GCS_BUCKET_NAME) {
      throw new Error(
        'GCS project ID and bucket name must be configured for GCS storage'
      );
    }

    const storageOptions: Record<string, unknown> = {
      projectId: env.GCS_PROJECT_ID,
    };

    if (env.GCS_KEY_FILE_PATH) {
      storageOptions['keyFilename'] = env.GCS_KEY_FILE_PATH;
    }

    this.storage = new Storage(storageOptions);
    this.bucket = env.GCS_BUCKET_NAME;
  }

  async uploadFile(filePath: string, key: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucket);
      await bucket.upload(filePath, { destination: key });
      return `gs://${this.bucket}/${key}`;
    } catch (error) {
      logger.error('Failed to upload file to GCS', { error, key });
      throw error;
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const bucket = this.storage.bucket(this.bucket);
      const file = bucket.file(key);
      const [data] = await file.download();
      return data;
    } catch (error) {
      logger.error('Failed to download file from GCS', { error, key });
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucket);
      await bucket.file(key).delete();
    } catch (error) {
      logger.error('Failed to delete file from GCS', { error, key });
      throw error;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    return `https://storage.googleapis.com/${this.bucket}/${key}`;
  }

  async cleanup(): Promise<void> {
    return Promise.resolve();
  }
}
