export interface ResponsiveViewport {
  name: 'desktop' | 'tablet' | 'mobile';
  width: number;
  height: number;
}

export interface ResponsiveScreenshot {
  viewport: ResponsiveViewport;
  screenshotUrl: string;
  screenshotBase64?: string;
}

export interface ResponsiveIssue {
  type:
    | 'horizontal-scroll'
    | 'overflow'
    | 'layout-breaking'
    | 'element-clipping'
    | 'other';
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  viewport: ResponsiveViewport['name'];
  description: string;
  element?: string;
  remediation?: string;
}

export interface ResponsiveTestResult {
  url: string;
  passed: boolean;
  issues: ResponsiveIssue[];
  screenshots: ResponsiveScreenshot[];
  timestamp: Date;
  metadata?: {
    aiEnabled: boolean;
    aiError?: string;
    processingTime?: number;
  };
}

export interface ResponsiveTestRequest {
  url: string;
  timeout?: number;
  skipCache?: boolean;
  aiApiKey?: string;
}
