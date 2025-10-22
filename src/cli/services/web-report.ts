/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class WebReportService {
  private templatesDir: string;
  private outputDir: string;

  constructor() {
    this.templatesDir = path.join(process.cwd(), 'web', 'templates');
    this.outputDir = path.join(process.cwd(), 'web', 'output');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate scan results HTML report
   */
  generateScanReport(scanData: any): string {
    const templatePath = path.join(this.templatesDir, 'scan-results.html');
    const template = fs.readFileSync(templatePath, 'utf8');

    let html = template;

    const totalPages = String(scanData.crawl?.totalPages || 0);
    const passedChecks = String(this.getTotalPassedChecks(scanData));
    const violations = String(this.getTotalViolations(scanData));
    const scanTimeMs = String(scanData.totalTime || 0);
    const scanTime = new Date().toLocaleString();

    html = html.replace(/\{\{TOTAL_PAGES\}\}/g, totalPages);
    html = html.replace(/\{\{PASSED_CHECKS\}\}/g, passedChecks);
    html = html.replace(/\{\{VIOLATIONS\}\}/g, violations);
    html = html.replace(/\{\{SCAN_TIME_MS\}\}/g, scanTimeMs);
    html = html.replace(/\{\{SCAN_TIME\}\}/g, scanTime);

    html = html.replace(
      /\{\{CRAWL_TABLE_ROWS\}\}/g,
      this.generateCrawlTableRows(scanData.crawl?.pages || [])
    );

    html = html.replace(
      /\{\{VIOLATIONS_SECTION\}\}/g,
      this.generateViolationsSection(scanData.accessibility?.results || [])
    );

    html = html.replace(
      /\{\{PASSED_CHECKS_SECTION\}\}/g,
      this.generatePassedChecksSection(scanData.accessibility?.results || [])
    );

    return this.saveHtmlFile(html, 'scan');
  }

  /**
   * Generate crawl results HTML report
   */
  generateCrawlReport(crawlData: any): string {
    const templatePath = path.join(this.templatesDir, 'crawl-results.html');
    const template = fs.readFileSync(templatePath, 'utf8');

    let html = template;

    const totalPages = String(crawlData.totalPages || 0);
    const successfulPages = String(
      this.getSuccessfulPages(crawlData.pages || [])
    );
    const crawlTimeMs = String(crawlData.crawlTime || 0);
    const crawlTime = new Date().toLocaleString();

    html = html.replace(/\{\{TOTAL_PAGES\}\}/g, totalPages);
    html = html.replace(/\{\{SUCCESSFUL_PAGES\}\}/g, successfulPages);
    html = html.replace(/\{\{CRAWL_TIME_MS\}\}/g, crawlTimeMs);
    html = html.replace(/\{\{CRAWL_TIME\}\}/g, crawlTime);

    html = html.replace(
      /\{\{CRAWL_TABLE_ROWS\}\}/g,
      this.generateCrawlTableRows(crawlData.pages || [])
    );

    return this.saveHtmlFile(html, 'crawl');
  }

  /**
   * Generate test results HTML report
   */
  generateTestReport(testData: any, testUrl: string): string {
    const templatePath = path.join(this.templatesDir, 'test-results.html');
    const template = fs.readFileSync(templatePath, 'utf8');

    let html = template;

    const score = String(testData.score || 'N/A');
    const passedChecks = String(testData.passes?.length || 0);
    const violations = String(testData.violations?.length || 0);
    const screenshotStatus = testData.screenshot
      ? 'Available'
      : 'Not available';
    const testTime = new Date().toLocaleString();

    html = html.replace(/\{\{TEST_URL\}\}/g, testUrl);
    html = html.replace(/\{\{SCORE\}\}/g, score);
    html = html.replace(/\{\{PASSED_CHECKS\}\}/g, passedChecks);
    html = html.replace(/\{\{VIOLATIONS\}\}/g, violations);
    html = html.replace(/\{\{SCREENSHOT_STATUS\}\}/g, screenshotStatus);
    html = html.replace(/\{\{TEST_TIME\}\}/g, testTime);

    html = html.replace(
      /\{\{VIOLATIONS_SECTION\}\}/g,
      this.generateTestViolationsSection(testData.violations || [])
    );

    html = html.replace(
      /\{\{PASSED_CHECKS_SECTION\}\}/g,
      this.generateTestPassedChecksSection(testData.passes || [])
    );

    return this.saveHtmlFile(html, 'test');
  }

  /**
   * Generate multiple test results HTML report
   */
  generateTestMultipleReport(testData: any): string {
    const templatePath = path.join(
      this.templatesDir,
      'test-multiple-results.html'
    );
    const template = fs.readFileSync(templatePath, 'utf8');

    let html = template;

    const totalPages = String(testData.totalPages || 0);
    const totalPassed = String(
      this.getTotalPassedChecksMultiple(testData.results || [])
    );
    const totalViolations = String(
      this.getTotalViolationsMultiple(testData.results || [])
    );
    const testTimeMs = String(testData.testTime || 0);
    const testTime = new Date().toLocaleString();

    html = html.replace(/\{\{TOTAL_PAGES\}\}/g, totalPages);
    html = html.replace(/\{\{TOTAL_PASSED\}\}/g, totalPassed);
    html = html.replace(/\{\{TOTAL_VIOLATIONS\}\}/g, totalViolations);
    html = html.replace(/\{\{TEST_TIME_MS\}\}/g, testTimeMs);
    html = html.replace(/\{\{TEST_TIME\}\}/g, testTime);

    html = html.replace(
      /\{\{PAGE_RESULTS\}\}/g,
      this.generatePageResults(testData.results || [])
    );

    return this.saveHtmlFile(html, 'test-multiple');
  }

  /**
   * Save HTML file and return the filename
   */
  private saveHtmlFile(html: string, type: string): string {
    const filename = `${type}-${uuidv4()}.html`;
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, html, 'utf8');

    return filename;
  }

  /**
   * Get the web URL for a generated report
   */
  getWebUrl(filename: string, port: number): string {
    return `http://localhost:${port}/web/${filename}`;
  }

  /**
   * Clean up old reports (optional)
   */
  cleanupOldReports(maxAge: number = 24 * 60 * 60 * 1000): void {
    try {
      const files = fs.readdirSync(this.outputDir);
      const now = Date.now();

      files.forEach((file) => {
        const filepath = path.join(this.outputDir, file);
        const stats = fs.statSync(filepath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filepath);
          console.log(`Cleaned up old report: ${file}`);
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup old reports:', error);
    }
  }

  private getTotalPassedChecks(scanData: any): number {
    if (!scanData.accessibility?.results) return 0;
    return scanData.accessibility.results.reduce(
      (total: number, result: any) => {
        return total + (result.passes?.length || 0);
      },
      0
    );
  }

  private getTotalViolations(scanData: any): number {
    if (!scanData.accessibility?.results) return 0;
    return scanData.accessibility.results.reduce(
      (total: number, result: any) => {
        return total + (result.violations?.length || 0);
      },
      0
    );
  }

  private getSuccessfulPages(pages: any[]): number {
    if (!pages || pages.length === 0) return 0;
    return pages.filter((page) => page.statusCode === 200).length;
  }

  private generateCrawlTableRows(pages: any[]): string {
    if (!pages || pages.length === 0) {
      return '<tr><td colspan="6" style="text-align: center; color: #6b7280;">No pages found</td></tr>';
    }

    return pages
      .map(
        (page, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>
          <a href="${page.url}" target="_blank" class="link">
            ${page.url}
          </a>
        </td>
        <td>${page.title || '-'}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${page.description || '-'}</td>
        <td>
          <span class="badge ${page.statusCode === 200 ? 'green' : 'red'}">
            ${page.statusCode || '-'}
          </span>
        </td>
        <td>${new Date(page.timestamp).toLocaleString()}</td>
      </tr>
    `
      )
      .join('');
  }

  private generateViolationsSection(results: any[]): string {
    const allViolations: any[] = [];
    results.forEach((result) => {
      if (result.violations) {
        result.violations.forEach((violation: any) => {
          allViolations.push({
            ...violation,
            url: result.url,
          });
        });
      }
    });

    if (allViolations.length === 0) {
      return `
        <div class="success">
          <div class="success-icon" style="color: #10b981;">🎉</div>
          <h3 class="success-title">No violations found!</h3>
          <p class="success-desc">Great job! Your website passed all accessibility checks.</p>
        </div>
      `;
    }

    return allViolations
      .map(
        (violation) => `
      <div class="violation">
        <div>
          <h4 class="violation-title">${violation.id}</h4>
          <p class="violation-desc">${violation.description}</p>
          <div style="margin-top: 0.5rem;">
            <span class="violation-impact">${violation.impact || 'unknown'} impact</span>
            <span style="font-size: 0.75rem; color: #6b7280;">
              URL: <a href="${violation.url}" target="_blank" class="link">${violation.url}</a>
            </span>
          </div>
          ${
            violation.aiExplanation
              ? `
            <div class="ai-explanation">
              <h5 class="ai-explanation-title">AI Explanation</h5>
              <p class="ai-explanation-text">${violation.aiExplanation}</p>
            </div>
          `
              : ''
          }
          ${
            violation.aiRemediation
              ? `
            <div class="ai-remediation">
              <h5 class="ai-remediation-title">AI Remediation</h5>
              <p class="ai-remediation-text">${violation.aiRemediation}</p>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `
      )
      .join('');
  }

  private generatePassedChecksSection(results: any[]): string {
    const allPassed: any[] = [];
    results.forEach((result) => {
      if (result.passes) {
        result.passes.forEach((pass: any) => {
          allPassed.push(pass);
        });
      }
    });

    if (allPassed.length === 0) {
      return '<div style="display: none;"></div>';
    }

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        ${allPassed
          .map(
            (pass) => `
          <div style="border: 1px solid rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.05); border-radius: 0.5rem; padding: 0.75rem;">
            <h4 style="font-size: 0.875rem; font-weight: 500; color: #111827; margin-bottom: 0.25rem;">${pass.id}</h4>
            <p style="font-size: 0.75rem; color: #6b7280;">${pass.description}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private generateTestViolationsSection(violations: any[]): string {
    if (!violations || violations.length === 0) {
      return `
        <div class="success">
          <div class="success-icon" style="color: #10b981;">🎉</div>
          <h3 class="success-title">No violations found!</h3>
          <p class="success-desc">Great job! This page passed all accessibility checks.</p>
        </div>
      `;
    }

    return violations
      .map(
        (violation) => `
      <div class="violation">
        <div>
          <h4 class="violation-title">${violation.id}</h4>
          <p class="violation-desc">${violation.description}</p>
          <div style="margin-top: 0.5rem;">
            <span class="violation-impact">${violation.impact || 'unknown'} impact</span>
            <span style="font-size: 0.75rem; color: #6b7280;">
              Help: <a href="${violation.helpUrl}" target="_blank" class="link">${violation.help}</a>
            </span>
          </div>
          ${
            violation.aiExplanation
              ? `
            <div class="ai-explanation">
              <h5 class="ai-explanation-title">AI Explanation</h5>
              <p class="ai-explanation-text">${violation.aiExplanation}</p>
            </div>
          `
              : ''
          }
          ${
            violation.aiRemediation
              ? `
            <div class="ai-remediation">
              <h5 class="ai-remediation-title">AI Remediation</h5>
              <p class="ai-remediation-text">${violation.aiRemediation}</p>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `
      )
      .join('');
  }

  private generateTestPassedChecksSection(passes: any[]): string {
    if (!passes || passes.length === 0) {
      return '<div style="display: none;"></div>';
    }

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        ${passes
          .map(
            (pass) => `
          <div style="border: 1px solid rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.05); border-radius: 0.5rem; padding: 0.75rem;">
            <h4 style="font-size: 0.875rem; font-weight: 500; color: #111827; margin-bottom: 0.25rem;">${pass.id}</h4>
            <p style="font-size: 0.75rem; color: #6b7280;">${pass.description}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private getTotalPassedChecksMultiple(results: any[]): number {
    if (!results || results.length === 0) return 0;
    return results.reduce((total, result) => {
      return total + (result.passes?.length || 0);
    }, 0);
  }

  private getTotalViolationsMultiple(results: any[]): number {
    if (!results || results.length === 0) return 0;
    return results.reduce((total, result) => {
      return total + (result.violations?.length || 0);
    }, 0);
  }

  private generatePageResults(results: any[]): string {
    if (!results || results.length === 0) {
      return '<div class="page-result"><p style="text-align: center; color: #6b7280;">No test results found</p></div>';
    }

    return results
      .map(
        (result, index) => `
      <div class="page-result">
        <div class="page-header">
          <div>
            <h3 class="page-title">Page ${index + 1}</h3>
            <a href="${result.url}" target="_blank" class="page-url">${result.url}</a>
          </div>
          <div class="page-stats">
            <div class="page-stat">
              <div class="page-stat-label">Score</div>
              <div class="page-stat-value">${result.score || 'N/A'}</div>
            </div>
            <div class="page-stat">
              <div class="page-stat-label">Status</div>
              <div>
                <span class="status-badge ${result.violations?.length === 0 ? 'passed' : 'issues'}">
                  ${result.violations?.length === 0 ? 'Passed' : 'Issues Found'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Violations -->
        ${
          result.violations && result.violations.length > 0
            ? `
          <div style="margin-bottom: 1rem;">
            <h4 style="font-size: 0.875rem; font-weight: 500; color: #111827; margin-bottom: 0.5rem;">Violations (${result.violations.length})</h4>
            <div>
              ${result.violations
                .slice(0, 3)
                .map(
                  (violation: any) => `
                <div class="violation">
                  <h5 class="violation-title">${violation.id}</h5>
                  <p class="violation-desc">${violation.description}</p>
                  <div style="margin-top: 0.25rem;">
                    <span class="violation-impact">${violation.impact || 'unknown'} impact</span>
                  </div>
                </div>
              `
                )
                .join('')}
              ${
                result.violations.length > 3
                  ? `
                <div style="text-align: center; padding: 0.5rem;">
                  <span style="font-size: 0.875rem; color: #6b7280;">... and ${result.violations.length - 3} more violations</span>
                </div>
              `
                  : ''
              }
            </div>
          </div>
        `
            : `
          <div class="success-message">
            <div class="success-icon">✅</div>
            <p class="success-text">No violations found</p>
          </div>
        `
        }

        <!-- Passed Checks -->
        ${
          result.passes && result.passes.length > 0
            ? `
          <div>
            <h4 style="font-size: 0.875rem; font-weight: 500; color: #111827; margin-bottom: 0.5rem;">Passed Checks (${result.passes.length})</h4>
            <div class="checks-grid">
              ${result.passes
                .slice(0, 8)
                .map(
                  (pass: any) => `
                <div class="passed-check">
                  <h5 class="passed-check-title">${pass.id}</h5>
                </div>
              `
                )
                .join('')}
              ${
                result.passes.length > 8
                  ? `
                <div class="more-indicator">
                  <span class="more-text">+${result.passes.length - 8} more</span>
                </div>
              `
                  : ''
              }
            </div>
          </div>
        `
            : ''
        }

        <!-- Screenshot -->
        ${
          result.screenshot
            ? `
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
            <h4 style="font-size: 0.875rem; font-weight: 500; color: #111827; margin-bottom: 0.5rem;">Screenshot</h4>
            <div style="font-size: 0.875rem; color: #6b7280;">
              <a href="/${result.screenshot}" target="_blank" class="link">View Screenshot</a>
            </div>
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('');
  }
}
