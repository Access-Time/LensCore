/* eslint-disable @typescript-eslint/no-explicit-any */
export class HtmlGeneratorService {
  static generateCrawlTableRows(pages: any[]): string {
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

  static generateViolationsSection(results: any[]): string {
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

  static generatePassedChecksSection(results: any[]): string {
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

  static generateTestViolationsSection(violations: any[]): string {
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

  static generateTestPassedChecksSection(passes: any[]): string {
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

  static generatePageResults(results: any[]): string {
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
