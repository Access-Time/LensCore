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

CRITICAL RULES:
1. You must respond ONLY with valid JSON in this exact format:
{
  "passed": boolean,
  "issues": [
    {
      "type": "horizontal-scroll" | "overflow" | "layout-breaking" | "element-clipping" | "other",
      "severity": "critical" | "serious" | "moderate" | "minor",
      "viewport": "desktop" | "tablet" | "mobile",
      "description": "Clear description of the issue",
      "element": "Optional: CSS selector or element description",
      "remediation": "Optional: Brief remediation suggestion"
    }
  ]
}

2. Issue types:
   - "horizontal-scroll": Page has horizontal scrolling when it shouldn't
   - "overflow": Content overflows its container
   - "layout-breaking": Layout breaks or elements stack incorrectly
   - "element-clipping": Elements are cut off or clipped
   - "other": Any other responsive design issue

3. Severity levels:
   - "critical": Makes the page unusable on the viewport
   - "serious": Significantly impacts usability
   - "moderate": Noticeable but doesn't break functionality
   - "minor": Minor visual issue

4. Be specific and accurate. Only report actual issues you can see in the screenshots.

5. If no issues are found, return {"passed": true, "issues": []}`;

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

If the page looks good across all viewports, return {"passed": true, "issues": []}`;

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

  static parseResponse(response: string): ResponsiveAIResponse {
    try {
      let cleanResponse = response.trim();

      cleanResponse = cleanResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '');

      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanResponse);

      if (typeof parsed.passed !== 'boolean') {
        throw new Error('Missing or invalid "passed" field');
      }

      if (!Array.isArray(parsed.issues)) {
        throw new Error('Missing or invalid "issues" field');
      }

      interface ParsedIssue {
        type?: string;
        severity?: string;
        viewport?: string;
        description?: string;
        element?: string;
        remediation?: string;
      }

      const issues: ResponsiveIssue[] = parsed.issues.map(
        (issue: ParsedIssue) => ({
          type: (issue.type as ResponsiveIssue['type']) || 'other',
          severity:
            (issue.severity as ResponsiveIssue['severity']) || 'moderate',
          viewport:
            (issue.viewport as ResponsiveIssue['viewport']) || 'desktop',
          description: issue.description || 'Responsive design issue detected',
          element: issue.element,
          remediation: issue.remediation,
        })
      );

      return {
        passed: parsed.passed,
        issues,
      };
    } catch {
      return {
        passed: false,
        issues: [
          {
            type: 'other',
            severity: 'moderate',
            viewport: 'desktop',
            description:
              'Failed to parse AI response. Please check the page manually.',
            remediation:
              'Review the responsive design manually or retry the test.',
          },
        ],
      };
    }
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
