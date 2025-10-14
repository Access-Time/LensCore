import { env } from '../utils/env';
import { StorageService } from './types';
import { LocalStorageService } from './local';
import { S3StorageService } from './s3';
import { GCSStorageService } from './gcs';

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
