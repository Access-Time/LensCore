export interface StorageService {
  uploadFile(filePath: string, key: string): Promise<string>;
  downloadFile(key: string): Promise<Buffer>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(key: string): Promise<string>;
  cleanup(): Promise<void>;
}
