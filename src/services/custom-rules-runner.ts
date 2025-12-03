import {
  CustomAxeRule,
  CustomPlaywrightTest,
  CustomTestResult,
  CustomRuleResult,
  PlaywrightTestContext,
} from '../types/custom-rules';
import type { Page } from 'playwright';

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

    if (rule.checks) {
      await page.evaluate(
        (checks: Record<string, AxeCheckConfig>) => {
          const windowWithAxe = window as unknown as WindowWithAxe;
          const axe = windowWithAxe.axe;
          if (axe && axe.configure) {
            const checksConfig: Record<string, AxeCheckConfig> = {};
            for (const [checkId, check] of Object.entries(checks)) {
              checksConfig[checkId] = {
                id: check.id,
                evaluate: check.evaluate
                  ? new Function('return ' + check.evaluate)()
                  : undefined,
                metadata: check.metadata,
              };
            }
            axe.configure({ checks: checksConfig });
          }
        },
        rule.checks as Record<string, AxeCheckConfig>
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
