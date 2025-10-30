/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, static as expressStatic } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { env } from '../../utils/env';

const router = Router();

/**
 * Find web output directory with multiple fallback paths
 */
function findWebOutputDir(): string {
  const possiblePaths = [
    // User's home directory (preferred for global usage)
    path.join(os.homedir(), '.lenscore', 'web', 'output'),
    // Current working directory with .lenscore
    path.join(process.cwd(), '.lenscore', 'web', 'output'),
    // Development mode - from source
    path.join(process.cwd(), 'web', 'output'),
    // Docker container - from app directory
    path.join('/app', 'web', 'output'),
  ];

  // Try to add global install path if available
  try {
    const globalPath = path.join(
      path.dirname(require.resolve('@accesstime/lenscore')),
      'web',
      'output'
    );
    possiblePaths.unshift(globalPath);
  } catch {
    // Package not found, skip this path
  }

  // Find the first existing path or use the first one
  const foundPath = possiblePaths.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  return foundPath || possiblePaths[0]!;
}

/**
 * Find styles directory with multiple fallback paths
 */
function findStylesDir(): string {
  const possiblePaths = [
    path.join(os.homedir(), '.lenscore', 'web', 'styles'),
    path.join(process.cwd(), '.lenscore', 'web', 'styles'),
    path.join(process.cwd(), 'web', 'styles'),
    path.join('/app', 'web', 'styles'),
  ];

  try {
    const globalPath = path.join(
      path.dirname(require.resolve('@accesstime/lenscore')),
      'web',
      'styles'
    );
    possiblePaths.unshift(globalPath);
  } catch {
    // Package not found, skip this path
  }

  const foundPath = possiblePaths.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  return foundPath || possiblePaths[0]!;
}

/**
 * Find screenshots directory with multiple fallback paths
 */
function findScreenshotsDir(): string {
  const possiblePaths = [
    // User's home directory (preferred for global usage) - CLI default
    path.join(os.homedir(), '.lenscore', 'storage', 'screenshots'),
    // Current working directory with .lenscore
    path.join(process.cwd(), '.lenscore', 'storage', 'screenshots'),
    // Use STORAGE_PATH from env if set
    env.STORAGE_PATH
      ? path.join(path.resolve(env.STORAGE_PATH), 'screenshots')
      : null,
    // Standard storage path (default)
    path.join(path.resolve(env.STORAGE_PATH || './storage'), 'screenshots'),
    // Development mode - from source
    path.join(process.cwd(), 'storage', 'screenshots'),
    // Docker container - from app directory
    path.join('/app', 'storage', 'screenshots'),
  ].filter((p): p is string => p !== null);

  // Find the first existing path that has files or use the first one
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
 * Serve CSS styles
 * GET /styles/report.css
 */
router.get('/styles/report.css', (_req: any, res: any) => {
  try {
    const stylesDir = findStylesDir();
    const filePath = path.join(stylesDir, 'report.css');

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

    const screenshotsDir = findScreenshotsDir();
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
 * Serve static documentation and assets
 */
router.use('/pages', expressStatic(path.join(process.cwd(), 'pages')));
router.use('/public', expressStatic(path.join(process.cwd(), 'public')));

/**
 * Serve root index.html
 */
router.get('/', (_req: any, res: any) => {
  try {
    const indexPath = path.join(process.cwd(), 'index.html');
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
