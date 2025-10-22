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

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.sendFile(filePath);
  } catch {
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

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    res.sendFile(filePath);
  } catch {
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
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
