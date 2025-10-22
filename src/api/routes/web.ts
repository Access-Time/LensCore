/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * Serve web reports
 * GET /web/:filename
 */
router.get('/web/:filename', (req: any, res: any) => {
  try {
    const { filename } = req.params;

    // Validate filename to prevent directory traversal
    if (
      !filename ||
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const webOutputDir = path.join(process.cwd(), 'web', 'output');
    const filePath = path.join(webOutputDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving web report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Serve screenshots
 * GET /storage/screenshots/:filename
 */
router.get('/storage/screenshots/:filename', (req: any, res: any) => {
  try {
    const { filename } = req.params;

    // Validate filename to prevent directory traversal
    if (
      !filename ||
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const screenshotsDir = path.join(process.cwd(), 'storage', 'screenshots');
    const filePath = path.join(screenshotsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    // Set appropriate headers for images
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving screenshot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * List available web reports
 * GET /web
 */
router.get('/web', (_req: any, res: any) => {
  try {
    const webOutputDir = path.join(process.cwd(), 'web', 'output');

    if (!fs.existsSync(webOutputDir)) {
      return res.json({ reports: [] });
    }

    const files = fs
      .readdirSync(webOutputDir)
      .filter((file) => file.endsWith('.html'))
      .map((file) => {
        const filePath = path.join(webOutputDir, file);
        const stats = fs.statSync(filePath);

        return {
          filename: file,
          url: `/web/${file}`,
          created: stats.birthtime,
          modified: stats.mtime,
          size: stats.size,
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime());

    res.json({ reports: files });
  } catch (error) {
    console.error('Error listing web reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
