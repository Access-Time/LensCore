import fs from 'fs/promises';
import AWS from 'aws-sdk';
import { env } from '../utils/env';
import logger from '../utils/logger';
import { StorageService } from './types';

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
    return Promise.resolve();
  }
}
