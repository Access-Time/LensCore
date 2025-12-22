/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, static as expressStatic } from 'express';
import { join, dirname } from 'path';
import fs from 'fs';
import { env } from '../../utils/env';
import { PathConfig } from '../../config/paths';

const router = Router();

function findWebOutputDir(): string {
  const possiblePaths = PathConfig.getWebOutputPaths();
  const foundPath = possiblePaths.find((p) => {
    try {
      if (fs.existsSync(p)) {
        return true;
      }
      const parentDir = dirname(p);
      if (fs.existsSync(parentDir)) {
        fs.mkdirSync(p, { recursive: true });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });
  const outputDir = foundPath || possiblePaths[0]!;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  return outputDir;
}

function findStylesDir(): string {
  const possiblePaths = PathConfig.getWebStylesPaths();
  const foundPath = possiblePaths.find((p) => {
    try {
      return fs.existsSync(p) && fs.existsSync(join(p, 'report.css'));
    } catch {
      return false;
    }
  });
  return foundPath || possiblePaths[0]!;
}

function findScreenshotsDir(): string {
  const possiblePaths = PathConfig.getScreenshotsPaths(env.STORAGE_PATH);
  const foundPath = possiblePaths.find((p) => {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
        const files = fs.readdirSync(p);
        if (files.length > 0) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  });
  return foundPath || possiblePaths[0]!;
}

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

    const webOutputDir = findWebOutputDir();
    const filePath = join(webOutputDir, filename);

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
 * Serve CSS styles
 * GET /styles/report.css
 */
router.get('/styles/report.css', (_req: any, res: any) => {
  try {
    const stylesDir = findStylesDir();
    const filePath = join(stylesDir, 'report.css');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'CSS file not found' });
    }

    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    res.sendFile(filePath);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Serve responsive screenshots
 * GET /storage/screenshots/responsive/:filename
 */
router.get('/storage/screenshots/responsive/:filename', (req: any, res: any) => {
  try {
    const { filename } = req.params;

    if (!filename || filename.includes('..') || filename.includes('\\') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const screenshotsDir = findScreenshotsDir();
    const filePath = join(screenshotsDir, 'responsive', filename);

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
 * Serve screenshots
 * GET /storage/screenshots/:filename
 */
router.get('/storage/screenshots/:filename', (req: any, res: any) => {
  try {
    const { filename } = req.params;

    if (!filename || filename.includes('..') || filename.includes('\\') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const screenshotsDir = findScreenshotsDir();
    const filePath = join(screenshotsDir, filename);

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
 * Serve static documentation and assets
 */
router.use('/pages', expressStatic(join(process.cwd(), 'pages')));
router.use('/public', expressStatic(join(process.cwd(), 'public')));

/**
 * Serve root index.html
 */
router.get('/', (_req: any, res: any) => {
  try {
    const indexPath = join(process.cwd(), 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html');
      res.sendFile(indexPath);
    } else {
      res.status(404).send('index.html not found');
    }
  } catch {
    res.status(500).send('Internal server error');
  }
});

/**
 * List available web reports
 * GET /web
 */
router.get('/web', (_req: any, res: any) => {
  try {
    const webOutputDir = findWebOutputDir();

    if (!fs.existsSync(webOutputDir)) {
      return res.json({ reports: [] });
    }

    const files = fs
      .readdirSync(webOutputDir)
      .filter((file) => file.endsWith('.html'))
      .map((file) => {
        const filePath = join(webOutputDir, file);
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
