import fs from 'fs/promises';
import path from 'path';
import AWS from 'aws-sdk';
import { Storage } from '@google-cloud/storage';
import { env } from '../utils/env';
import logger from '../utils/logger';

export interface StorageService {
  uploadFile(filePath: string, key: string): Promise<string>;
  downloadFile(key: string): Promise<Buffer>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(key: string): Promise<string>;
  cleanup(): Promise<void>;
}

export class LocalStorageService implements StorageService {
  private basePath: string;

  constructor(basePath: string = env.STORAGE_PATH) {
    this.basePath = basePath;
  }

  async uploadFile(filePath: string, key: string): Promise<string> {
    try {
      await fs.mkdir(path.dirname(path.join(this.basePath, key)), {
        recursive: true,
      });
      await fs.copyFile(filePath, path.join(this.basePath, key));
      return path.join(this.basePath, key);
    } catch (error) {
      logger.error('Failed to upload file to local storage', { error, key });
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

export class S3StorageService implements StorageService {
  private s3: AWS.S3;
  private bucket: string;

  constructor() {
    if (
      !env.AWS_ACCESS_KEY_ID ||
      !env.AWS_SECRET_ACCESS_KEY ||
      !env.AWS_S3_BUCKET
    ) {
      throw new Error(
        'AWS credentials and bucket must be configured for S3 storage'
      );
    }

    this.s3 = new AWS.S3({
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
    });
    this.bucket = env.AWS_S3_BUCKET;
  }

  async uploadFile(filePath: string, key: string): Promise<string> {
    try {
      const fileContent = await fs.readFile(filePath);
      const result = await this.s3
        .upload({
          Bucket: this.bucket,
          Key: key,
          Body: fileContent,
        })
        .promise();
      return result.Location;
    } catch (error) {
      logger.error('Failed to upload file to S3', { error, key });
      throw error;
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const result = await this.s3
        .getObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
      return result.Body as Buffer;
    } catch (error) {
      logger.error('Failed to download file from S3', { error, key });
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
    } catch (error) {
      logger.error('Failed to delete file from S3', { error, key });
      throw error;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    return `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async cleanup(): Promise<void> {
    // No-op cleanup for S3 in tests
    return Promise.resolve();
  }
}

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
    // No-op cleanup for GCS in tests
    return Promise.resolve();
  }
}

export function createStorageService(): StorageService {
  switch (env.STORAGE_TYPE) {
    case 's3':
      return new S3StorageService();
    case 'gcs':
      return new GCSStorageService();
    case 'local':
    default:
      return new LocalStorageService();
  }
}
