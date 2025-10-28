/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CacheConfig {
  type: 'memory' | 'redis' | 'filesystem';
  ttl: number;
  maxSize?: number;
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  filesystem?: {
    path: string;
  };
}

export interface CacheKey {
  ruleId: string;
  projectContext: {
    framework?: string;
    cssFramework?: string;
    language?: string;
    buildTool?: string;
    additionalContext?: string;
  };
}

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}
