/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  static saveHtmlFile(html: string, type: string, outputDir: string): string {
    const filename = `${type}-${uuidv4()}.html`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, html, 'utf8');

    return filename;
  }

  static getWebUrl(filename: string, port: number): string {
    return `http://localhost:${port}/web/${filename}`;
  }

  static cleanupOldReports(
    outputDir: string,
    maxAge: number = 24 * 60 * 60 * 1000
  ): void {
    try {
      const files = fs.readdirSync(outputDir);
      const now = Date.now();

      files.forEach((file) => {
        const filepath = path.join(outputDir, file);
        const stats = fs.statSync(filepath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filepath);
          console.log(`Cleaned up old report: ${file}`);
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup old reports:', error);
    }
  }
}
