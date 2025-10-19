export interface StorageConfig {
  type: 'local' | 's3' | 'gcs';
  path?: string;
  bucket?: string;
  region?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    keyFile?: string;
  };
}
