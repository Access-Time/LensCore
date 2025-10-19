import {
  CacheService,
  MemoryCacheBackend,
  FilesystemCacheBackend,
  RedisCacheBackend,
} from '../../src/services/cache';
import { CacheConfig, CacheKey, CacheEntry } from '../../src/types/cache';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    unlink: jest.fn(),
    readdir: jest.fn(),
  },
}));

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    disconnect: jest.fn().mockResolvedValue(undefined),
  }));
});

describe('CacheService', () => {
  let cacheService: CacheService;
  const mockConfig: CacheConfig = {
    type: 'memory',
    ttl: 3600,
  };

  beforeEach(() => {
    CacheService.cleanup();
    cacheService = CacheService.getInstance(mockConfig);
  });

  afterEach(async () => {
    await CacheService.cleanup();
  });

  const mockCacheKey: CacheKey = {
    ruleId: 'color-contrast',
    projectContext: {
      framework: 'react',
      cssFramework: 'tailwind',
      language: 'typescript',
    },
  };

  const mockCacheValue = {
    rule_id: 'color-contrast',
    plain_explanation: 'Test explanation',
    remediation: 'Test remediation',
  };

  describe('getInstance', () => {
    it('should create singleton instance', () => {
      const instance1 = CacheService.getInstance(mockConfig);
      const instance2 = CacheService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Memory Cache Operations', () => {
    it('should set and get cache entry', async () => {
      await cacheService.set(mockCacheKey, mockCacheValue);
      const result = await cacheService.get(mockCacheKey);

      expect(result).toBeDefined();
      expect(result?.value).toEqual(mockCacheValue);
      expect(result?.key).toBeDefined();
      expect(result?.timestamp).toBeDefined();
      expect(result?.ttl).toBe(3600);
    });

    it('should return null for non-existent key', async () => {
      const nonExistentKey: CacheKey = {
        ruleId: 'non-existent',
        projectContext: {},
      };

      const result = await cacheService.get(nonExistentKey);
      expect(result).toBeNull();
    });

    it('should delete cache entry', async () => {
      await cacheService.set(mockCacheKey, mockCacheValue);
      await cacheService.delete(mockCacheKey);
      const result = await cacheService.get(mockCacheKey);

      expect(result).toBeNull();
    });

    it('should clear all cache entries', async () => {
      await cacheService.set(mockCacheKey, mockCacheValue);
      await cacheService.clear();
      const result = await cacheService.get(mockCacheKey);

      expect(result).toBeNull();
    });

    it('should return cache stats', async () => {
      await cacheService.set(mockCacheKey, mockCacheValue);
      await cacheService.get(mockCacheKey);

      const stats = await cacheService.getStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');
      expect(stats.hits).toBeGreaterThan(0);
    });
  });

  describe('Key Generation', () => {
    it('should generate consistent keys for same input', async () => {
      const key1 = mockCacheKey;
      const key2 = { ...mockCacheKey };

      await cacheService.set(key1, mockCacheValue);
      const result = await cacheService.get(key2);

      expect(result).toBeDefined();
      expect(result?.value).toEqual(mockCacheValue);
    });

    it('should generate different keys for different contexts', async () => {
      const key1: CacheKey = {
        ruleId: 'color-contrast',
        projectContext: { framework: 'react' },
      };

      const key2: CacheKey = {
        ruleId: 'color-contrast',
        projectContext: { framework: 'vue' },
      };

      await cacheService.set(key1, mockCacheValue);
      const result = await cacheService.get(key2);

      expect(result).toBeNull();
    });
  });
});

describe('MemoryCacheBackend', () => {
  let backend: MemoryCacheBackend;

  beforeEach(() => {
    backend = new MemoryCacheBackend();
  });

  it('should handle cache expiration', async () => {
    const entry: CacheEntry = {
      key: 'test-key',
      value: {
        rule_id: 'test',
        plain_explanation: 'test',
        remediation: 'test',
      },
      timestamp: Date.now() - 4000000,
      ttl: 1,
    };

    await backend.set('test-key', entry, 1);
    const result = await backend.get('test-key');

    expect(result).toBeNull();
  });

  it('should track cache hits and misses', async () => {
    const entry: CacheEntry = {
      key: 'test-key',
      value: {
        rule_id: 'test',
        plain_explanation: 'test',
        remediation: 'test',
      },
      timestamp: Date.now(),
      ttl: 3600,
    };

    await backend.set('test-key', entry, 3600);
    await backend.get('test-key');
    await backend.get('non-existent');

    const stats = await backend.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(0.5);
  });
});

describe('FilesystemCacheBackend', () => {
  let backend: FilesystemCacheBackend;

  beforeEach(() => {
    backend = new FilesystemCacheBackend('/tmp/test-cache');
  });

  it('should generate file paths correctly', () => {
    const key = 'test-key';
    const filePath = (
      backend as unknown as { getFilePath: (key: string) => string }
    ).getFilePath(key);

    expect(filePath).toMatch(/^\/tmp\/test-cache\/.*\.json$/);
  });

  it('should handle file read errors gracefully', async () => {
    const fs = jest.mocked(await import('fs'));
    fs.promises.readFile.mockRejectedValueOnce(new Error('File not found'));

    const result = await backend.get('non-existent-key');
    expect(result).toBeNull();
  });

  it('should handle file write errors gracefully', async () => {
    const fs = jest.mocked(await import('fs'));
    fs.promises.writeFile.mockRejectedValueOnce(new Error('Permission denied'));

    const entry: CacheEntry = {
      key: 'test-key',
      value: {
        rule_id: 'test',
        plain_explanation: 'test',
        remediation: 'test',
      },
      timestamp: Date.now(),
      ttl: 3600,
    };

    await expect(backend.set('test-key', entry, 3600)).resolves.not.toThrow();
  });
});

describe('RedisCacheBackend', () => {
  let backend: RedisCacheBackend;
  let mockRedis: unknown;

  beforeEach(async () => {
    const Redis = jest.mocked(await import('ioredis')).default;
    mockRedis = new Redis();
    backend = new RedisCacheBackend({
      host: 'localhost',
      port: 6379,
    });
  });

  afterEach(async () => {
    if (backend) {
      await backend.disconnect();
    }
    jest.clearAllMocks();
  });

  it('should handle Redis connection errors', async () => {
    (mockRedis as { get: jest.Mock }).get.mockRejectedValueOnce(
      new Error('Connection failed')
    );

    const result = await backend.get('test-key');
    expect(result).toBeNull();
  });

  it('should handle Redis set errors', async () => {
    (mockRedis as { setex: jest.Mock }).setex.mockRejectedValueOnce(
      new Error('Connection failed')
    );

    const entry: CacheEntry = {
      key: 'test-key',
      value: {
        rule_id: 'test',
        plain_explanation: 'test',
        remediation: 'test',
      },
      timestamp: Date.now(),
      ttl: 3600,
    };

    await expect(backend.set('test-key', entry, 3600)).resolves.not.toThrow();
  });

  it('should handle Redis delete errors', async () => {
    (mockRedis as { del: jest.Mock }).del.mockRejectedValueOnce(
      new Error('Connection failed')
    );

    await expect(backend.delete('test-key')).resolves.not.toThrow();
  });

  it('should handle Redis clear errors', async () => {
    (mockRedis as { keys: jest.Mock }).keys.mockRejectedValueOnce(
      new Error('Connection failed')
    );

    await expect(backend.clear()).resolves.not.toThrow();
  });

  it('should handle Redis stats errors', async () => {
    (mockRedis as { keys: jest.Mock }).keys.mockRejectedValueOnce(
      new Error('Connection failed')
    );

    const stats = await backend.getStats();
    expect(stats).toEqual({ hits: 0, misses: 0, size: 0, hitRate: 0 });
  });
});
