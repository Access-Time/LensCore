import { CacheConfig, CacheKey, CacheEntry, CacheStats } from '../types/cache';
import logger from '../utils/logger';
import { promises as fs } from 'fs';
import Redis from 'ioredis';

export abstract class CacheBackend {
  abstract get(key: string): Promise<CacheEntry | null>;
  abstract set(key: string, value: CacheEntry, ttl: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract getStats(): Promise<CacheStats>;
}

export class MemoryCacheBackend extends CacheBackend {
  private cache = new Map<string, CacheEntry>();
  private stats = { hits: 0, misses: 0 };

  async get(key: string): Promise<CacheEntry | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry;
  }

  async set(key: string, value: CacheEntry, ttl: number): Promise<void> {
    this.cache.set(key, { ...value, ttl });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }
}

export class FilesystemCacheBackend extends CacheBackend {
  private path: string;

  constructor(path: string) {
    super();
    this.path = path;
  }

  private getFilePath(key: string): string {
    const hash = Buffer.from(key).toString('base64').replace(/[/+=]/g, '');
    return `${this.path}/${hash}.json`;
  }

  async get(key: string): Promise<CacheEntry | null> {
    try {
      const filePath = this.getFilePath(key);
      const data = await fs.readFile(filePath, 'utf8');
      const entry: CacheEntry = JSON.parse(data);

      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl * 1000) {
        await this.delete(key);
        return null;
      }

      return entry;
    } catch (error) {
      logger.error('Failed to read cache file', { error, key });
      return null;
    }
  }

  async set(key: string, value: CacheEntry, ttl: number): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      await fs.mkdir(this.path, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify({ ...value, ttl }));
    } catch (error) {
      logger.error('Failed to write cache file', { error, key });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, ignore
      logger.error('Failed to delete cache file', { error, key });
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.path);
      await Promise.all(
        files.map((file: string) => fs.unlink(`${this.path}/${file}`))
      );
    } catch (error) {
      logger.error('Failed to clear cache', { error });
      // Directory doesn't exist, ignore
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const files = await fs.readdir(this.path);
      return {
        hits: 0,
        misses: 0,
        size: files.length,
        hitRate: 0,
      };
    } catch (error) {
      logger.error('Failed to get stats', { error });
      return { hits: 0, misses: 0, size: 0, hitRate: 0 };
    }
  }
}

export class RedisCacheBackend extends CacheBackend {
  private redis!: Redis;
  private connected = false;

  constructor(config: CacheConfig['redis']) {
    super();
    try {
      this.redis = new Redis({
        host: config?.host || 'localhost',
        port: config?.port || 6379,
        password: config?.password,
        db: config?.db || 0,
        maxRetriesPerRequest: 3,
      });

      this.redis.on('connect', () => {
        this.connected = true;
        logger.info('Redis cache connected');
      });

      this.redis.on('error', (error: Error) => {
        this.connected = false;
        logger.error('Redis cache error', { error: error.message });
      });
    } catch (error) {
      logger.error('Failed to initialize Redis', { error });
      this.connected = false;
    }
  }

  async get(key: string): Promise<CacheEntry | null> {
    if (!this.connected) return null;

    try {
      const data = await this.redis.get(`lenscore:cache:${key}`);
      if (!data) return null;

      const entry: CacheEntry = JSON.parse(data);

      if (Date.now() - entry.timestamp > entry.ttl * 1000) {
        await this.delete(key);
        return null;
      }

      return entry;
    } catch (error) {
      logger.error('Redis get error', { error, key });
      return null;
    }
  }

  async set(key: string, value: CacheEntry, ttl: number): Promise<void> {
    if (!this.connected) return;

    try {
      await this.redis.setex(
        `lenscore:cache:${key}`,
        ttl,
        JSON.stringify({ ...value, ttl })
      );
    } catch (error) {
      logger.error('Redis set error', { error, key });
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.connected) return;

    try {
      await this.redis.del(`lenscore:cache:${key}`);
    } catch (error) {
      logger.error('Redis delete error', { error, key });
    }
  }

  async clear(): Promise<void> {
    if (!this.connected) return;

    try {
      const keys = await this.redis.keys('lenscore:cache:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Redis clear error', { error });
    }
  }

  async getStats(): Promise<CacheStats> {
    if (!this.connected) {
      return { hits: 0, misses: 0, size: 0, hitRate: 0 };
    }

    try {
      const keys = await this.redis.keys('lenscore:cache:*');
      return {
        hits: 0,
        misses: 0,
        size: keys.length,
        hitRate: 0,
      };
    } catch {
      return { hits: 0, misses: 0, size: 0, hitRate: 0 };
    }
  }
}

export class CacheService {
  private backend: CacheBackend;
  private config: CacheConfig;
  private static instance: CacheService | null = null;

  constructor(config: CacheConfig) {
    this.config = config;
    this.backend = this.createBackend();
  }

  static getInstance(config?: CacheConfig): CacheService {
    if (!CacheService.instance && config) {
      CacheService.instance = new CacheService(config);
    }
    if (!CacheService.instance) {
      throw new Error('CacheService not initialized. Call getInstance with config first.');
    }
    return CacheService.instance;
  }

  private createBackend(): CacheBackend {
    switch (this.config.type) {
      case 'memory':
        return new MemoryCacheBackend();
      case 'filesystem':
        return new FilesystemCacheBackend(
          this.config.filesystem?.path || './cache'
        );
      case 'redis':
        return new RedisCacheBackend(this.config.redis);
      default:
        logger.warn('Unknown cache type, falling back to memory');
        return new MemoryCacheBackend();
    }
  }

  private generateKey(cacheKey: CacheKey): string {
    const { ruleId, projectContext } = cacheKey;

    // Create a deterministic hash from project context
    const contextParts = [
      projectContext.framework,
      projectContext.cssFramework,
      projectContext.language,
      projectContext.buildTool,
      projectContext.additionalContext,
    ].filter(Boolean);

    const contextString = contextParts.join('|');
    return `${ruleId}|${contextString}`;
  }

  async get(cacheKey: CacheKey): Promise<CacheEntry | null> {
    const key = this.generateKey(cacheKey);
    return await this.backend.get(key);
  }

  async set(cacheKey: CacheKey, value: CacheEntry['value']): Promise<void> {
    const key = this.generateKey(cacheKey);
    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      ttl: this.config.ttl,
    };

    await this.backend.set(key, entry, this.config.ttl);
  }

  async delete(cacheKey: CacheKey): Promise<void> {
    const key = this.generateKey(cacheKey);
    await this.backend.delete(key);
  }

  async clear(): Promise<void> {
    await this.backend.clear();
  }

  async getStats(): Promise<CacheStats> {
    return await this.backend.getStats();
  }
}
