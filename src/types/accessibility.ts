import { ResponsiveTestResult } from './responsive';
import { AIProcessedIssue } from './ai';

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary: string;
  }>;
}

export interface AccessibilityResult {
  url: string;
  score: number;
  violations: AccessibilityViolation[];
  passes: AccessibilityViolation[];
  incomplete: AccessibilityViolation[];
  inapplicable: AccessibilityViolation[];
  screenshot?: string | undefined;
  timestamp: Date;
}

export interface AccessibilityRequest {
  url: string;
  timeout?: number;
  includeScreenshot?: boolean;
  rules?: string[];
  tags?: string[];
}

export interface AccessibilityResponse {
  results: AccessibilityResult[];
  totalPages: number;
  testTime: number;
}

export interface AccessibilityTestResponse
  extends Omit<AccessibilityResult, 'violations'> {
  violations: AIProcessedIssue[];
  aiEnabled?: boolean;
  aiError?: string;
  metadata?: {
    enabled?: boolean;
    error?: string;
    processingTime?: number;
  };
  responsive?:
    | ResponsiveTestResult
    | {
        error: string;
        passed: false;
      };
}
