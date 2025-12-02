import { OpenAIMessage } from '../services/openai';
import { ResponsiveScreenshot, ResponsiveIssue } from '../types/responsive';

export interface ResponsiveAIResponse {
  passed: boolean;
  issues: Array<{
    type:
      | 'horizontal-scroll'
      | 'overflow'
      | 'layout-breaking'
      | 'element-clipping'
      | 'other';
    severity: 'critical' | 'serious' | 'moderate' | 'minor';
    viewport: 'desktop' | 'tablet' | 'mobile';
    description: string;
    element?: string;
    remediation?: string;
  }>;
}

export class ResponsivePromptEngine {
  private static readonly SYSTEM_PROMPT = `You are an expert web developer and UI/UX specialist specializing in responsive design testing. Your task is to analyze screenshots of a webpage at different viewport sizes and detect responsive design issues.

Issue types:
- "horizontal-scroll": Page has horizontal scrolling when it shouldn't
- "overflow": Content overflows its container
- "layout-breaking": Layout breaks or elements stack incorrectly
- "element-clipping": Elements are cut off or clipped
- "other": Any other responsive design issue

Severity levels:
- "critical": Makes the page unusable on the viewport
- "serious": Significantly impacts usability
- "moderate": Noticeable but doesn't break functionality
- "minor": Minor visual issue

Be specific and accurate. Only report actual issues you can see in the screenshots.`;

  static getResponseSchema(): Record<string, unknown> {
    return {
      type: 'object',
      properties: {
        passed: {
          type: 'boolean',
          description: 'Whether the page passed responsive design tests',
        },
        issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [
                  'horizontal-scroll',
                  'overflow',
                  'layout-breaking',
                  'element-clipping',
                  'other',
                ],
                description: 'Type of responsive design issue',
              },
              severity: {
                type: 'string',
                enum: ['critical', 'serious', 'moderate', 'minor'],
                description: 'Severity level of the issue',
              },
              viewport: {
                type: 'string',
                enum: ['desktop', 'tablet', 'mobile'],
                description: 'Viewport where the issue was detected',
              },
              description: {
                type: 'string',
                description: 'Clear description of the issue',
              },
              element: {
                type: ['string', 'null'],
                description:
                  'CSS selector or element description, or null if not applicable',
              },
              remediation: {
                type: ['string', 'null'],
                description:
                  'Brief remediation suggestion, or null if not applicable',
              },
            },
            required: [
              'type',
              'severity',
              'viewport',
              'description',
              'element',
              'remediation',
            ],
            additionalProperties: false,
          },
        },
      },
      required: ['passed', 'issues'],
      additionalProperties: false,
    };
  }

  static generatePrompt(screenshots: ResponsiveScreenshot[]): OpenAIMessage[] {
    const screenshotDescriptions = screenshots
      .map(
        (screenshot, index) =>
          `Screenshot ${index + 1} - ${screenshot.viewport.name.toUpperCase()} (${screenshot.viewport.width}x${screenshot.viewport.height}):\n[Image will be provided as base64]`
      )
      .join('\n\n');

    const userPrompt = `Analyze these screenshots of a webpage at different viewport sizes and detect any responsive design issues:

${screenshotDescriptions}

Check for:
1. Horizontal scrolling (page should not scroll horizontally)
2. Content overflow (content should not overflow containers)
3. Layout breaking (elements should not break or stack incorrectly)
4. Element clipping (elements should not be cut off)
5. Any other responsive design problems

For each issue found, provide:
- Type of issue
- Severity level
- Which viewport(s) are affected
- Clear description
- Optional: Element identifier or CSS selector
- Optional: Brief remediation suggestion

If the page looks good across all viewports, set passed to true and issues to an empty array.`;

    interface ImageContent {
      type: 'image_url';
      image_url: {
        url: string;
      };
    }

    interface TextContent {
      type: 'text';
      text: string;
    }

    const imageContents: ImageContent[] = screenshots
      .filter((s) => s.screenshotBase64)
      .map((screenshot) => ({
        type: 'image_url' as const,
        image_url: {
          url: `data:image/png;base64,${screenshot.screenshotBase64}`,
        },
      }));

    const textContent = `${userPrompt}\n\nScreenshots provided: ${screenshots.length} images`;

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: this.SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: textContent,
          } as TextContent,
          ...imageContents,
        ],
      },
    ];

    return messages;
  }

  static parseStructuredResponse(
    parsed: ResponsiveAIResponse
  ): ResponsiveAIResponse {
    const issues: ResponsiveIssue[] = parsed.issues.map((issue) => ({
      type: issue.type || 'other',
      severity: issue.severity || 'moderate',
      viewport: issue.viewport || 'desktop',
      description: issue.description || 'Responsive design issue detected',
      element:
        issue.element && issue.element !== null ? issue.element : undefined,
      remediation:
        issue.remediation && issue.remediation !== null
          ? issue.remediation
          : undefined,
    }));

    return {
      passed: parsed.passed,
      issues,
    };
  }

  static createFallbackResponse(): ResponsiveAIResponse {
    return {
      passed: false,
      issues: [
        {
          type: 'other',
          severity: 'moderate',
          viewport: 'desktop',
          description: 'AI evaluation failed. Please check the page manually.',
          remediation:
            'Review the responsive design manually or check AI API configuration.',
        },
      ],
    };
  }
}
