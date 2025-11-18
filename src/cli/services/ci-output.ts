/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

export interface CIOutputOptions {
  exitOnViolations?: boolean;
  outputFile?: string;
  showDetails?: boolean;
}

export class CIOutputService {
  /**
   * Format scan result for CI output
   */
  static formatScanResult(
    result: any,
    options: CIOutputOptions = {}
  ): {
    violations: number;
    pages: number;
    exitCode: number;
  } {
    const accessibilityResults = result.accessibility?.results || [];
    const totalPages = accessibilityResults.length || 0;
    const totalViolations = accessibilityResults.reduce(
      (sum: number, page: any) => sum + (page.violations?.length || 0),
      0
    );

    console.log('\n');
    console.log('==========================================');
    if (totalViolations > 0) {
      console.log('ACCESSIBILITY VIOLATIONS DETECTED');
    } else {
      console.log('✅ NO ACCESSIBILITY VIOLATIONS FOUND');
    }
    console.log('==========================================');
    console.log('');

    console.log(`Pages scanned: ${totalPages}`);
    console.log(`Total violations: ${totalViolations}`);

    if (totalViolations > 0 && options.showDetails !== false) {
      console.log('');
      console.log('--- Violation Details ---');
      this.displayViolations(accessibilityResults);
      console.log('');
      console.log('==========================================');
      console.log('How to fix:');
      console.log('  1. Review each violation above');
      console.log('  2. Check the Help URL for detailed guidance');
      console.log('  3. Fix the issues in your code');
      console.log('  4. Re-run the workflow to verify fixes');
      console.log('==========================================');
      console.log('');
    }

    const exitCode =
      totalViolations > 0 && options.exitOnViolations !== false ? 1 : 0;

    if (totalViolations > 0) {
      console.log(
        `::error::Accessibility violations detected: ${totalViolations}`
      );
    } else {
      console.log('✅ No violations found');
    }

    return {
      violations: totalViolations,
      pages: totalPages,
      exitCode,
    };
  }

  /**
   * Format test result for CI output
   */
  static formatTestResult(
    result: any,
    options: CIOutputOptions = {}
  ): {
    violations: number;
    exitCode: number;
  } {
    const violations = result.violations?.length || 0;

    console.log('\n');
    console.log('==========================================');
    if (violations > 0) {
      console.log('ACCESSIBILITY VIOLATIONS DETECTED');
    } else {
      console.log('✅ NO ACCESSIBILITY VIOLATIONS FOUND');
    }
    console.log('==========================================');
    console.log('');

    console.log(`Page: ${result.url || 'Unknown'}`);
    console.log(`Total violations: ${violations}`);

    if (violations > 0 && options.showDetails !== false) {
      console.log('');
      console.log('--- Violation Details ---');
      this.displayPageViolations(result);
      console.log('');
      console.log('==========================================');
      console.log('How to fix:');
      console.log('  1. Review each violation above');
      console.log('  2. Check the Help URL for detailed guidance');
      console.log('  3. Fix the issues in your code');
      console.log('  4. Re-run the workflow to verify fixes');
      console.log('==========================================');
      console.log('');
    }

    const exitCode =
      violations > 0 && options.exitOnViolations !== false ? 1 : 0;

    if (violations > 0) {
      console.log(`::error::Accessibility violations detected: ${violations}`);
    } else {
      console.log('✅ No violations found');
    }

    return {
      violations,
      exitCode,
    };
  }

  /**
   * Display violations for multiple pages
   */
  private static displayViolations(results: any[]): void {
    for (const page of results) {
      if (!page.violations || page.violations.length === 0) {
        continue;
      }

      console.log(`\nPage: ${page.url || 'Unknown'}`);

      for (const violation of page.violations) {
        this.displayViolation(violation);
      }
    }
  }

  /**
   * Display violations for a single page
   */
  private static displayPageViolations(page: any): void {
    if (!page.violations || page.violations.length === 0) {
      return;
    }

    for (const violation of page.violations) {
      this.displayViolation(violation);
    }
  }

  /**
   * Display a single violation
   */
  private static displayViolation(violation: any): void {
    const id = violation.id || 'unknown';
    const impact = violation.impact || 'unknown';
    const description = violation.description || 'N/A';
    const help = violation.help || 'N/A';
    const helpUrl = violation.helpUrl || 'N/A';

    console.log(`  ❌ ${id} [${impact}]`);
    console.log(`     Description: ${description}`);
    console.log(`     Help: ${help}`);
    console.log(`     Help URL: ${helpUrl}`);

    if (violation.nodes && violation.nodes.length > 0) {
      for (const node of violation.nodes) {
        const target = node.target
          ? Array.isArray(node.target)
            ? node.target.join(', ')
            : node.target
          : 'N/A';
        const html = node.html ? String(node.html).substring(0, 100) : 'N/A';
        const summary =
          node.failureSummary || (node.any && node.any[0]?.message) || 'N/A';
        const summaryText = String(summary).substring(0, 200);

        console.log(`     - Element: ${target}`);
        console.log(`       HTML: ${html}`);
        console.log(`       Summary: ${summaryText}`);
      }
    }

    console.log('');
  }

  /**
   * Save result to JSON file
   */
  static async saveResultToFile(
    result: any,
    outputFile: string
  ): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(outputFile, JSON.stringify(result, null, 2));
  }

  /**
   * Handle scan result with CI output
   */
  static async handleScanResult(
    result: any,
    options: CIOutputOptions = {}
  ): Promise<number> {
    // Save to file if specified
    if (options.outputFile) {
      await this.saveResultToFile(result, options.outputFile);
    }

    // Format and display CI output
    const { exitCode } = this.formatScanResult(result, options);

    return exitCode;
  }

  /**
   * Handle test result with CI output
   */
  static async handleTestResult(
    result: any,
    options: CIOutputOptions = {}
  ): Promise<number> {
    // Save to file if specified
    if (options.outputFile) {
      await this.saveResultToFile(result, options.outputFile);
    }

    // Format and display CI output
    const { exitCode } = this.formatTestResult(result, options);

    return exitCode;
  }

  /**
   * Handle fallback when scan fails
   */
  static async handleFallback(
    testOutput: string,
    _scanUrl: string,
    options: CIOutputOptions = {}
  ): Promise<number> {
    try {
      // Try to parse JSON from test output
      let testResult: any = null;

      // Try direct JSON parse
      try {
        testResult = JSON.parse(testOutput);
      } catch {
        // Try to extract JSON from output
        const jsonMatch = testOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          testResult = JSON.parse(jsonMatch[0]);
        }
      }

      if (testResult && testResult.url) {
        // Create scan-like structure from test result
        const scanResult = {
          crawl: {
            pages: [],
            totalPages: 1,
            crawlTime: 0,
          },
          accessibility: {
            results: [testResult],
            totalPages: 1,
            testTime: testResult.metadata?.processingTime || 0,
          },
          totalTime: testResult.metadata?.processingTime || 0,
        };

        return await this.handleScanResult(scanResult, options);
      }
    } catch (error) {
      console.error('Failed to parse fallback result:', error);
    }

    // If we can't parse, create empty result
    const emptyResult = {
      accessibility: { results: [] },
    };

    return await this.handleScanResult(emptyResult, options);
  }
}
