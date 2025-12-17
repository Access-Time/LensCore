export interface AccessibilityIssue {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl?: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary?: string;
  }>;
}

export interface AIProcessedIssue extends AccessibilityIssue {
  title?: string;
  summary?: string;
  explanation?: string;
  wcag?: Array<{ level: string; name: string; link: string }>;
  act_rules?: Array<{ name: string; link: string }>;
  supporting_links?: Array<{ name: string; link: string }>;
  aiExplanation?: string;
  aiRemediation?: string;
  userStory?: string;
}

export interface AIProcessingOptions {
  apiKey?: string;
  includeExplanations?: boolean;
  includeRemediation?: boolean;
  projectContext?: {
    framework?: string;
    cssFramework?: string;
    language?: string;
    buildTool?: string;
    additionalContext?: string;
  };
}

export interface AIProcessingResult {
  enabled: boolean;
  issues: AIProcessedIssue[];
  error?: string;
  metadata?: {
    cacheHits: number;
    cacheMisses: number;
    processingTime: number;
  };
}

export interface AICrawlResult {
  issues: AccessibilityIssue[];
  url?: string;
  timestamp?: Date;
  [key: string]: unknown;
}

export interface CombinedResult {
  results: AICrawlResult[];
  summary?: {
    totalIssues: number;
    totalUrls: number;
  };
  [key: string]: unknown;
}
