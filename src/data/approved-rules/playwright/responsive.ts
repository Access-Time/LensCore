import {
  CustomPlaywrightTest,
  PlaywrightTestContext,
  CustomTestResult,
  CustomRuleResult,
} from '../../../types/custom-rules';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import { readFileSync, existsSync } from 'fs';
import os from 'os';
import { join } from 'path';
import { createOpenAIService } from '../../../utils/openai';
import { scrollPageToWaitForAnimations } from '../../../utils/playwright-scroll';
import { registerCustomRuleRenderer } from '../../../utils/custom-rule-renderer';
import { HtmlGeneratorService } from '../../../cli/services/utils/html-generator';

interface Viewport {
  name: string;
  width: number;
  height: number;
}

interface ResponsiveIssue {
  type: string;
  viewport: string;
  description: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  element?: string;
  remediation?: string;
}

interface ResponsiveScreenshot {
  viewport: {
    name: string;
    width: number;
    height: number;
  };
  screenshotUrl: string;
}

interface ResponsiveAnalysisIssue {
  type: string;
  description: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  element?: string;
  remediation?: string;
}

interface ResponsiveAnalysisResponse {
  hasIssues: boolean;
  issues: ResponsiveAnalysisIssue[];
}

const viewports: Viewport[] = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

const responsiveRule: CustomPlaywrightTest = {
  id: 'responsive',
  name: 'Responsive Design Test',
  description:
    'Tests responsive design by taking screenshots at different viewport sizes and analyzing them with AI',
  enabled: true,
  severity: 'serious',
  run: async (context: PlaywrightTestContext): Promise<CustomTestResult> => {
    const { page, enableAI, aiApiKey, model, storageService } = context;

    if (!storageService) {
      return {
        id: 'responsive',
        name: 'Responsive Design Test',
        passed: false,
        severity: 'serious',
        description: 'Storage service is not available',
        error: 'Storage service is required for responsive test',
      };
    }

    if (!enableAI || !aiApiKey) {
      return {
        id: 'responsive',
        name: 'Responsive Design Test',
        passed: false,
        severity: 'serious',
        description: 'AI is required for responsive test',
        error: 'AI API key is required for responsive test',
      };
    }

    const screenshots: ResponsiveScreenshot[] = [];
    const issues: ResponsiveIssue[] = [];
    const warnings: ResponsiveIssue[] = [];

    try {
      for (const viewport of viewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        await scrollPageToWaitForAnimations(page);
        await page.waitForTimeout(500);

        const screenshot = await page.screenshot({ fullPage: true });
        const screenshotId = uuidv4();
        const screenshotKey = `screenshots/responsive/${screenshotId}-${viewport.name}.png`;
        const tempPath = join(
          os.tmpdir(),
          `${screenshotId}-${viewport.name}.png`
        );

        await fs.writeFile(tempPath, screenshot);
        const screenshotUrl = await storageService.uploadFile(
          tempPath,
          screenshotKey
        );

        await fs.unlink(tempPath).catch(() => {});

        screenshots.push({
          viewport: {
            name: viewport.name,
            width: viewport.width,
            height: viewport.height,
          },
          screenshotUrl,
        });

        try {
          const openaiService = createOpenAIService(aiApiKey);
          if (openaiService) {
            const base64Image = screenshot.toString('base64');
            const imageUrl = `data:image/png;base64,${base64Image}`;

            const visionModels = [
              'gpt-4o',
              'gpt-4-turbo',
              'gpt-4-vision-preview',
              'gpt-4o-mini',
            ];
            const currentModel = model || 'gpt-3.5-turbo';
            const useVisionModel = visionModels.some((vm) =>
              currentModel.includes(vm)
            );

            if (!useVisionModel) {
              warnings.push({
                type: 'Model Limitation',
                viewport: viewport.name,
                description:
                  'Current model does not support image analysis. Please use a vision-capable model like gpt-4o, gpt-4-turbo, or gpt-4-vision-preview.',
                severity: 'minor',
              });
              continue;
            }

            const prompt = `Analyze this screenshot of a webpage at ${viewport.name} viewport (${viewport.width}x${viewport.height}). Check for:
1. Horizontal scrolling issues
2. Content overflow issues
3. Layout breaking issues
4. Elements that are cut off or not visible
5. Text that is too small or unreadable
6. Buttons or interactive elements that are too small or overlapping`;

            const visionModel =
              visionModels.find((vm) => currentModel.includes(vm)) || 'gpt-4o';

            const jsonSchema = {
              name: 'responsive_analysis',
              schema: {
                type: 'object',
                properties: {
                  hasIssues: {
                    type: 'boolean',
                  },
                  issues: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                        },
                        description: {
                          type: 'string',
                        },
                        severity: {
                          type: 'string',
                          enum: ['minor', 'moderate', 'serious', 'critical'],
                        },
                        element: {
                          type: 'string',
                        },
                        remediation: {
                          type: 'string',
                        },
                      },
                      required: ['type', 'description', 'severity'],
                    },
                  },
                },
                required: ['hasIssues', 'issues'],
              },
              strict: true,
            };

            const response =
              await openaiService.generateStructuredResponse<ResponsiveAnalysisResponse>(
                [
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: prompt,
                      },
                      {
                        type: 'image_url',
                        image_url: {
                          url: imageUrl,
                        },
                      },
                    ],
                  },
                ],
                jsonSchema,
                { model: visionModel }
              );

            const analysis = response.content;
            if (analysis.issues && Array.isArray(analysis.issues)) {
              for (const issue of analysis.issues) {
                issues.push({
                  type: issue.type || 'Layout Issue',
                  viewport: viewport.name,
                  description: issue.description || 'Unknown issue',
                  severity: issue.severity || ('moderate' as const),
                  element: issue.element,
                  remediation: issue.remediation,
                });
              }
            }
          }
        } catch (aiError) {
          issues.push({
            type: 'AI Analysis Error',
            viewport: viewport.name,
            description:
              aiError instanceof Error
                ? aiError.message
                : 'Failed to analyze screenshot with AI',
            severity: 'minor',
          });
        }
      }
    } catch (error) {
      return {
        id: 'responsive',
        name: 'Responsive Design Test',
        passed: false,
        severity: 'serious',
        description: 'Failed to capture responsive screenshots',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          screenshots,
          issues,
          warnings,
        },
      };
    }

    return {
      id: 'responsive',
      name: 'Responsive Design Test',
      passed: issues.length === 0,
      severity: 'serious',
      description:
        issues.length === 0
          ? 'No responsive design issues found across all viewports'
          : `Found ${issues.length} responsive design issue${issues.length > 1 ? 's' : ''} across viewports`,
      metadata: {
        screenshots,
        issues,
        warnings,
      },
    };
  },
};

const getResponsiveStyles = (): string => {
  try {
    const currentDir =
      typeof __dirname !== 'undefined' ? __dirname : process.cwd();
    const stylesPath = join(currentDir, 'styles', 'responsive-styles.css');
    if (existsSync(stylesPath)) {
      return readFileSync(stylesPath, 'utf-8');
    }
    return '';
  } catch {
    return '';
  }
};

const responsiveRenderer = {
  renderReportSection(result: CustomRuleResult): string {
    const responsiveData = {
      passed: result.passed,
      issues: result.violations || [],
      screenshots: (result.metadata?.['screenshots'] as unknown[]) || [],
      warnings: (result.metadata?.['warnings'] as unknown[]) || [],
    };
    const html = HtmlGeneratorService.generateResponsiveSection(responsiveData);
    const styles = getResponsiveStyles();
    return styles ? `<style>${styles}</style>${html}` : html;
  },
  getCustomStyles(): string {
    return getResponsiveStyles();
  },
};

registerCustomRuleRenderer('responsive', responsiveRenderer);

export default responsiveRule;
