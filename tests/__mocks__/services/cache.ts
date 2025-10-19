import { CacheConfig, CacheKey, CacheEntry, CacheStats } from '../../../src/types/cache';

export class CacheService {
  private static instance: CacheService | null = null;
  private mockCache = new Map<string, CacheEntry>();
  private mockStats = { hits: 0, misses: 0 };

  constructor(_config: CacheConfig) {
    // Mock implementation
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

  async get(cacheKey: CacheKey): Promise<CacheEntry | null> {
    const key = this.generateKey(cacheKey);
    const entry = this.mockCache.get(key);
    
    if (!entry) {
      this.mockStats.misses++;
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.mockCache.delete(key);
      this.mockStats.misses++;
      return null;
    }

    this.mockStats.hits++;
    return entry;
  }

  async set(cacheKey: CacheKey, value: CacheEntry['value']): Promise<void> {
    const key = this.generateKey(cacheKey);
    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      ttl: 3600
    };
    this.mockCache.set(key, entry);
  }

  async delete(cacheKey: CacheKey): Promise<void> {
    const key = this.generateKey(cacheKey);
    this.mockCache.delete(key);
  }

  async clear(): Promise<void> {
    this.mockCache.clear();
    this.mockStats = { hits: 0, misses: 0 };
  }

  async getStats(): Promise<CacheStats> {
    const total = this.mockStats.hits + this.mockStats.misses;
    return {
      hits: this.mockStats.hits,
      misses: this.mockStats.misses,
      size: this.mockCache.size,
      hitRate: total > 0 ? this.mockStats.hits / total : 0
    };
  }

  async disconnect(): Promise<void> {
    // Mock implementation
  }

  static async cleanup(): Promise<void> {
    if (CacheService.instance) {
      await CacheService.instance.disconnect();
      CacheService.instance = null;
    }
  }

  private generateKey(cacheKey: CacheKey): string {
    const { ruleId, projectContext } = cacheKey;
    const contextParts = [
      projectContext.framework,
      projectContext.cssFramework,
      projectContext.language,
      projectContext.buildTool,
      projectContext.additionalContext
    ].filter(Boolean);
    const contextString = contextParts.join('|');
    return `${ruleId}|${contextString}`;
  }
}
