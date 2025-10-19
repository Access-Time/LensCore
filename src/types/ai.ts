export interface AccessibilityIssue {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary?: string;
  }>;
}

export interface AIProcessedIssue extends AccessibilityIssue {
  aiExplanation?: string;
  aiRemediation?: string;
}

export interface AIProcessingOptions {
  apiKey?: string;
  includeExplanations?: boolean;
  includeRemediation?: boolean;
  techStack?: string;
}

export interface AIProcessingResult {
  enabled: boolean;
  issues: AIProcessedIssue[];
  error?: string;
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
