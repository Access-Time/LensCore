import {
  CustomAxeRule,
  CustomPlaywrightTest,
  CustomTestResult,
  CustomRuleResult,
  PlaywrightTestContext,
  CustomRulesManifest,
} from '../types/custom-rules';
import type { Page } from 'playwright';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { PathConfig } from '../config/paths';

interface AxeRuleConfigValue {
  enabled: boolean;
  tags?: string[];
  matches?: string;
  excludeHidden?: boolean;
  all?: string[];
  any?: string[];
  none?: string[];
}

interface AxeCheckConfig {
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

interface AxeViolation {
  id: string;
  impact?: 'minor' | 'moderate' | 'serious' | 'critical';
  description?: string;
  nodes?: Array<{
    target?: string[];
    html?: string;
    failureSummary?: string;
  }>;
}

interface AxeResults {
  violations: AxeViolation[];
}

interface WindowWithAxe extends Window {
  axe?: {
    configure: (config: {
      rules?: Record<string, AxeRuleConfigValue>;
      checks?: Record<string, AxeCheckConfig>;
    }) => void;
    run: (
      context?: Document | Element,
      options?: {
        rules?: Record<string, { enabled: boolean }>;
      }
    ) => Promise<AxeResults>;
  };
}

export class CustomRulesRunner {
  private approvedRuleIds: Set<string> | null = null;

  private async getApprovedRuleIds(): Promise<Set<string>> {
    if (this.approvedRuleIds !== null) {
      return this.approvedRuleIds;
    }

    const approvedIds = new Set<string>();
    try {
      const approvedRulesPath = PathConfig.getApprovedRulesPath();
      const manifestPath = join(approvedRulesPath, 'manifest.json');

      if (existsSync(manifestPath)) {
        const manifestContent = await readFile(manifestPath, 'utf-8');
        const manifest: CustomRulesManifest = JSON.parse(manifestContent);

        for (const rule of manifest.rules) {
          if (rule.enabled && rule.type === 'axe') {
            approvedIds.add(rule.id);
          }
        }
      }
    } catch {
      // If we can't load approved rules, assume none are approved
    }

    this.approvedRuleIds = approvedIds;
    return approvedIds;
  }

  private isApprovedRule(ruleId: string, approvedIds: Set<string>): boolean {
    return approvedIds.has(ruleId);
  }

  private validateEvaluateString(evaluate: string): boolean {
    // Block dangerous patterns that could lead to code injection
    const dangerousPatterns = [
      /eval\s*\(/i,
      /Function\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /import\s*\(/i,
      /require\s*\(/i,
      /document\.write/i,
      /innerHTML\s*=/i,
      /outerHTML\s*=/i,
      /\.exec\s*\(/i,
      /\.compile\s*\(/i,
    ];

    return !dangerousPatterns.some((pattern) => pattern.test(evaluate));
  }

  async runAxeRules(
    rules: CustomAxeRule[],
    page: Page,
    _axe: unknown
  ): Promise<CustomRuleResult[]> {
    const results: CustomRuleResult[] = [];

    for (const rule of rules) {
      if (!rule.enabled) {
        continue;
      }

      try {
        const result = await this.runAxeRule(rule, page, _axe);
        results.push(result);
      } catch (error) {
        results.push({
          type: 'axe',
          id: rule.id,
          name: rule.metadata?.description || rule.id,
          passed: false,
          violations: [
            {
              id: rule.id,
              name: rule.id,
              passed: false,
              severity: rule.severity || 'moderate',
              description: `Error running rule: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        });
      }
    }

    return results;
  }

  private async runAxeRule(
    rule: CustomAxeRule,
    page: Page,
    _axe: unknown
  ): Promise<CustomRuleResult> {
    const ruleIdToCheck = rule.rule?.id || rule.id;
    const approvedIds = await this.getApprovedRuleIds();
    const isApproved = this.isApprovedRule(rule.id, approvedIds);

    if (rule.checks) {
      // Filter out evaluate strings from non-approved rules or validate them
      const safeChecks: Record<string, AxeCheckConfig> = {};
      for (const [checkId, check] of Object.entries(rule.checks)) {
        if (check.evaluate) {
          if (isApproved) {
            // Approved rules can use Function evaluation
            safeChecks[checkId] = check;
          } else if (this.validateEvaluateString(check.evaluate)) {
            // Non-approved rules must pass validation
            safeChecks[checkId] = check;
          } else {
            // Skip dangerous evaluate strings from non-approved rules
            safeChecks[checkId] = {
              id: check.id,
              metadata: check.metadata,
            };
          }
        } else {
          safeChecks[checkId] = check;
        }
      }

      await page.evaluate(
        (params: {
          checks: Record<string, AxeCheckConfig>;
          approved: boolean;
        }) => {
          const windowWithAxe = window as unknown as WindowWithAxe;
          const axe = windowWithAxe.axe;
          if (axe && axe.configure) {
            const checksConfig: Record<string, AxeCheckConfig> = {};
            for (const [checkId, check] of Object.entries(params.checks)) {
              checksConfig[checkId] = {
                id: check.id,
                evaluate: check.evaluate
                  ? params.approved
                    ? new Function('return ' + check.evaluate)()
                    : undefined
                  : undefined,
                metadata: check.metadata,
              };
            }
            axe.configure({ checks: checksConfig });
          }
        },
        {
          checks: safeChecks as Record<string, AxeCheckConfig>,
          approved: isApproved,
        }
      );
    }

    const axeResults = await page.evaluate(
      (params: { ruleId: string; tags?: string[] }): Promise<AxeResults> => {
        const windowWithAxe = window as unknown as WindowWithAxe;
        const axe = windowWithAxe.axe;
        if (!axe || !axe.run) {
          return Promise.resolve({ violations: [] });
        }
        const options: {
          rules?: Record<string, { enabled: boolean }>;
          tags?: string[];
        } = {
          rules: {
            [params.ruleId]: { enabled: true },
          },
        };
        if (params.tags && params.tags.length > 0) {
          options.tags = params.tags;
        }
        return axe.run(document, options);
      },
      {
        ruleId: ruleIdToCheck,
        tags: rule.rule?.tags,
      }
    );

    const violations: CustomTestResult[] = [];
    const ruleViolations = axeResults.violations.filter(
      (v: AxeViolation) => v.id === ruleIdToCheck || v.id === rule.id
    );

    for (const violation of ruleViolations) {
      const severity: 'minor' | 'moderate' | 'serious' | 'critical' =
        rule.severity ||
        (violation.impact &&
        ['minor', 'moderate', 'serious', 'critical'].includes(violation.impact)
          ? violation.impact
          : 'moderate');

      violations.push({
        id: rule.id,
        name: rule.id,
        passed: false,
        severity,
        description:
          violation.description ||
          rule.metadata?.description ||
          `Custom rule violation: ${rule.id}`,
        nodes: violation.nodes?.map((node) => ({
          target: node.target || [],
          html: node.html || '',
          failureSummary: node.failureSummary || '',
        })),
      });
    }

    return {
      type: 'axe',
      id: rule.id,
      name: rule.metadata?.description || rule.id,
      passed: violations.length === 0,
      violations,
    };
  }

  async runPlaywrightTests(
    tests: CustomPlaywrightTest[],
    context: PlaywrightTestContext
  ): Promise<CustomRuleResult[]> {
    const results: CustomRuleResult[] = [];

    for (const test of tests) {
      if (!test.enabled) {
        continue;
      }

      try {
        const result = await this.runPlaywrightTest(test, context);
        results.push(result);
      } catch (error) {
        results.push({
          type: 'playwright',
          id: test.id,
          name: test.name,
          passed: false,
          violations: [
            {
              id: test.id,
              name: test.name,
              passed: false,
              severity: test.severity || 'moderate',
              description: `Error running test: ${error instanceof Error ? error.message : String(error)}`,
              error: error instanceof Error ? error.message : String(error),
            },
          ],
        });
      }
    }

    return results;
  }

  private async runPlaywrightTest(
    test: CustomPlaywrightTest,
    context: PlaywrightTestContext
  ): Promise<CustomRuleResult> {
    const testResult = await test.run(context);

    const violations: CustomTestResult[] = [];

    if (!testResult.passed) {
      if (
        testResult.metadata &&
        Array.isArray(testResult.metadata['issues']) &&
        testResult.metadata['issues'].length > 0
      ) {
        for (const issue of testResult.metadata['issues']) {
          violations.push({
            id: testResult.id,
            name: testResult.name,
            passed: false,
            severity: issue.severity || testResult.severity,
            description: `${issue.type} on ${issue.viewport}: ${issue.description}`,
            nodes: issue.element
              ? [
                  {
                    target: [issue.element],
                    html: '',
                    failureSummary: `${issue.type} on ${issue.viewport}: ${issue.description}${issue.remediation ? ` - ${issue.remediation}` : ''}`,
                  },
                ]
              : undefined,
            metadata: {
              type: issue.type,
              viewport: issue.viewport,
              element: issue.element,
              remediation: issue.remediation,
              ...testResult.metadata,
            },
          });
        }
      } else {
        violations.push({
          id: testResult.id,
          name: testResult.name,
          passed: false,
          severity: testResult.severity,
          description: testResult.description,
          nodes: testResult.nodes,
          error: testResult.error,
          metadata: testResult.metadata,
        });
      }
    }

    const result: CustomRuleResult = {
      type: 'playwright',
      id: test.id,
      name: test.name,
      passed: testResult.passed,
      violations,
      metadata: testResult.metadata,
    };

    return result;
  }

  normalizeResults(results: CustomRuleResult[]): {
    violations: CustomTestResult[];
    passed: boolean;
  } {
    const violations: CustomTestResult[] = [];
    let allPassed = true;

    for (const result of results) {
      if (!result.passed) {
        allPassed = false;
      }
      violations.push(...result.violations);
    }

    return {
      violations,
      passed: allPassed,
    };
  }
}
