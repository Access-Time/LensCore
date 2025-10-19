import { CacheConfig } from '../types/cache';
import { env } from '../utils/env';

export function createCacheConfig(): CacheConfig {
  const config: CacheConfig = {
    type: env.CACHE_TYPE,
    ttl: parseInt(env.CACHE_TTL, 10),
    maxSize: parseInt(env.CACHE_MAX_SIZE, 10),
  };

  if (config.type === 'filesystem') {
    config.filesystem = {
      path: env.CACHE_PATH,
    };
  }

  if (config.type === 'redis') {
    config.redis = {
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT, 10),
      password: env.REDIS_PASSWORD,
      db: parseInt(env.REDIS_DB, 10),
    };
  }

  return config;
}
