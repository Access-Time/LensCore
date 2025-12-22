import type { Page, Browser } from 'playwright';
import type { StorageService } from '../storage/types';
import type { CacheService } from '../services/cache';

export interface CustomAxeRule {
  id: string;
  enabled: boolean;
  metadata?: {
    description?: string;
    help?: string;
    helpUrl?: string;
  };
  rule?: {
    id: string;
    enabled: boolean;
    tags?: string[];
    matches?: string;
    excludeHidden?: boolean;
    all?: string[];
    any?: string[];
    none?: string[];
  };
  checks?: Record<
    string,
    {
      id: string;
      evaluate?: string;
      metadata?: {
        messages?: {
          pass?: string;
          fail?: string;
          incomplete?: string;
        };
      };
    }
  >;
  severity?: 'minor' | 'moderate' | 'serious' | 'critical';
}

export interface CustomPlaywrightTest {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  severity?: 'minor' | 'moderate' | 'serious' | 'critical';
  run: (context: PlaywrightTestContext) => Promise<CustomTestResult>;
}

export interface PlaywrightTestContext {
  page: Page;
  url: string;
  browser: Browser | null;
  timeout?: number;
  enableAI?: boolean;
  aiApiKey?: string;
  model?: string;
  storageService?: StorageService;
  cacheService?: CacheService;
}

export interface CustomTestResult {
  id: string;
  name: string;
  passed: boolean;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  nodes?: Array<{
    target: string[];
    html: string;
    failureSummary: string;
  }>;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface CustomRuleConfig {
  version: string;
  lensCoreVersion?: string;
  axeRules?: CustomAxeRule[];
  playwrightTests?: string[];
  disableDefaultRules?: string[];
  enableDefaultRules?: string[];
  ruleSeverities?: Record<
    string,
    'minor' | 'moderate' | 'serious' | 'critical'
  >;
}

export interface CustomRulesManifest {
  version: string;
  rules: Array<{
    id: string;
    type: 'axe' | 'playwright';
    name: string;
    description?: string;
    enabled: boolean;
    source: string;
  }>;
}

export interface CustomRuleResult {
  type: 'axe' | 'playwright';
  id: string;
  name: string;
  passed: boolean;
  violations: CustomTestResult[];
  metadata?: Record<string, unknown>;
}
