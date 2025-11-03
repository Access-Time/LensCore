/* eslint-disable @typescript-eslint/no-explicit-any */
import Handlebars from 'handlebars';
import marked from 'marked';

export class HtmlGeneratorService {
  private static escapeHtml(text: string): string {
    return Handlebars.escapeExpression(text);
  }

  private static formatHtml(htmlString: string): string {
    if (!htmlString) return '';

    const formatted = htmlString.trim();
    let indent = 0;
    let result = '';
    let i = 0;

    while (i < formatted.length) {
      const char = formatted[i];

      if (char === '<') {
        const tagEnd = formatted.indexOf('>', i);
        if (tagEnd === -1) break;

        const tag = formatted.substring(i, tagEnd + 1);
        const tagName = tag.match(/<\/?(\w+)/)?.[1] || '';

        if (tag.startsWith('</')) {
          indent = Math.max(0, indent - 1);
          result += '\n' + '  '.repeat(indent) + tag;
        } else if (
          tag.endsWith('/>') ||
          ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName)
        ) {
          result += '\n' + '  '.repeat(indent) + tag;
        } else if (tag.startsWith('<!')) {
          result += tag;
        } else {
          result += '\n' + '  '.repeat(indent) + tag;
          if (
            ![
              'area',
              'base',
              'br',
              'col',
              'embed',
              'hr',
              'img',
              'input',
              'link',
              'meta',
              'param',
              'source',
              'track',
              'wbr',
            ].includes(tagName)
          ) {
            indent++;
          }
        }

        i = tagEnd + 1;
      } else {
        result += char;
        i++;
      }
    }

    return result.trim();
  }

  private static markdownToHtml(text: string): string {
    if (!text) return '';
    return marked.parse(text) as string;
  }

  private static generateCollapsibleCode(
    nodes: any[],
    type: 'problem' | 'solution'
  ): string {
    const isProblem = type === 'problem';
    const icon = isProblem ? '⚠️' : '✅';
    const title = isProblem ? 'Problematic Code Detected' : 'AI Remediation';
    const className = isProblem ? 'problem' : 'solution';

    return `
      <details class="code-collapsible ${className}">
        <summary class="code-collapsible-summary">
          <span>${icon} ${title}</span>
          <span class="code-collapsible-arrow">▼</span>
        </summary>
        <div class="code-collapsible-content">
          ${nodes
            .map(
              (node: any, idx: number) => `
            <div class="code-node" ${idx < nodes.length - 1 ? '' : 'style="margin-bottom: 0;"'}>
              ${node.target ? `<div class="code-target">Target: ${this.escapeHtml(node.target.join(' > '))}</div>` : ''}
              <div class="code-block">
                <pre>${this.escapeHtml(this.formatHtml(node.html))}</pre>
              </div>
              ${node.failureSummary ? `<div class="code-failure-summary">${this.escapeHtml(node.failureSummary)}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      </details>
    `;
  }

  static generateCrawlTableRows(pages: any[]): string {
    if (!pages || pages.length === 0) {
      return '<tr><td colspan="6" class="text-center text-gray">No pages found</td></tr>';
    }

    return pages
      .map(
        (page, index) => `
      <tr>
        <td>${index + 1}</td>
        <td class="table-url-cell">
          <a href="${page.url}" target="_blank" class="link" title="${page.url}">
            ${page.url}
          </a>
        </td>
        <td class="table-title-cell" title="${page.title || '-'}">${page.title || '-'}</td>
        <td class="table-desc-cell" title="${page.description || '-'}">${page.description || '-'}</td>
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
          <div class="success-icon">🎉</div>
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
          <div class="mt-1">
            <div class="violation-item-meta">
              <span class="violation-impact">${violation.impact || 'unknown'} impact</span>
              <div class="violation-url">
                URL: <a href="${violation.url}" target="_blank" class="violation-url-link">${violation.url}</a>
              </div>
            </div>
          </div>
          ${
            violation.nodes && violation.nodes.length > 0
              ? this.generateCollapsibleCode(violation.nodes, 'problem')
              : ''
          }
          ${
            violation.userStory
              ? `
            <div class="ai-explanation ai-section">
              <h5 class="ai-section-title">User Story</h5>
              <div class="ai-section-text">${this.escapeHtml(violation.userStory)}</div>
            </div>
          `
              : ''
          }
          ${
            violation.aiExplanation
              ? `
            <div class="ai-explanation ai-section">
              <h5 class="ai-section-title">AI Explanation</h5>
              <div class="ai-section-text">${this.markdownToHtml(violation.aiExplanation)}</div>
            </div>
          `
              : ''
          }
          ${
            violation.aiRemediation
              ? `
            <div class="ai-remediation ai-section">
              <h5 class="ai-section-title">Solution</h5>
              <div class="ai-section-text">${this.markdownToHtml(violation.aiRemediation)}</div>
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

  static generateTestViolationsSection(violations: any[]): string {
    if (!violations || violations.length === 0) {
      return `
        <div class="success">
          <div class="success-icon">🎉</div>
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
          <div class="mt-1">
            <div class="violation-item-meta">
              <span class="violation-impact">${violation.impact || 'unknown'} impact</span>
              <div class="violation-url">
                Help: <a href="${violation.helpUrl}" target="_blank" class="violation-url-link">${violation.help}</a>
              </div>
            </div>
          </div>
          ${
            violation.nodes && violation.nodes.length > 0
              ? this.generateCollapsibleCode(violation.nodes, 'problem')
              : ''
          }
          ${
            violation.userStory
              ? `
            <div class="ai-explanation ai-section">
              <h5 class="ai-section-title">User Story</h5>
              <div class="ai-section-text">${this.escapeHtml(violation.userStory)}</div>
            </div>
          `
              : ''
          }
          ${
            violation.aiExplanation
              ? `
            <div class="ai-explanation ai-section">
              <h5 class="ai-section-title">AI Explanation</h5>
              <div class="ai-section-text">${this.markdownToHtml(violation.aiExplanation)}</div>
            </div>
          `
              : ''
          }
          ${
            violation.aiRemediation
              ? `
            <div class="ai-remediation ai-section">
              <h5 class="ai-section-title">Solution</h5>
              <div class="ai-section-text">${this.markdownToHtml(violation.aiRemediation)}</div>
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

  static extractScreenshotPath(screenshotUrl: string): string {
    if (!screenshotUrl) return '';
    if (
      screenshotUrl.startsWith('http://') ||
      screenshotUrl.startsWith('https://')
    ) {
      return screenshotUrl;
    }
    if (screenshotUrl.startsWith('gs://')) {
      const parts = screenshotUrl.split('/');
      return `/storage/screenshots/${parts[parts.length - 1]}`;
    }
    if (screenshotUrl.includes('screenshots/')) {
      const parts = screenshotUrl.split('screenshots/');
      const fileName = parts[parts.length - 1];
      if (fileName && fileName !== screenshotUrl) {
        return `/storage/screenshots/${fileName}`;
      }
    }
    if (screenshotUrl.includes('screenshots\\')) {
      const parts = screenshotUrl.split('screenshots\\');
      const fileName = parts[parts.length - 1];
      if (fileName && fileName !== screenshotUrl) {
        return `/storage/screenshots/${fileName}`;
      }
    }
    const fileName = screenshotUrl.split(/[/\\]/).pop() || screenshotUrl;
    if (fileName && fileName.endsWith('.png')) {
      return `/storage/screenshots/${fileName}`;
    }
    return `/storage/screenshots/${screenshotUrl}`;
  }

  private static generateScreenshotSection(
    imgPath: string,
    url: string
  ): string {
    return `
      <div class="screenshot-section">
        <h4 class="screenshot-title">Screenshot</h4>
        <div class="screenshot-container">
          <div class="screenshot-wrapper">
            <img 
              src="${imgPath}" 
              alt="Screenshot of ${this.escapeHtml(url)}" 
              class="screenshot-image"
              onclick="window.open('${imgPath}', '_blank')"
            />
          </div>
          <div class="screenshot-footer">
            <a href="${imgPath}" target="_blank" class="screenshot-link">Open full size</a>
          </div>
        </div>
      </div>
    `;
  }

  static generatePageResultsForScan(results: any[]): string {
    if (!results || results.length === 0) {
      return '<div class="empty-state">No accessibility results found</div>';
    }

    return results
      .map((result, index) => {
        const imgPath = result.screenshot
          ? this.extractScreenshotPath(result.screenshot)
          : null;
        return `
      <div class="report-card">
        <div class="report-card-header">
          <h3 class="report-card-title">
            Page ${index + 1}
          </h3>
          <a href="${this.escapeHtml(result.url)}" target="_blank" class="report-card-url">
            ${this.escapeHtml(result.url)}
          </a>
          <div class="report-card-stats">
            <div class="report-card-stat">
              Violations: <span class="report-card-stat-value ${result.violations?.length > 0 ? 'warning' : 'success'}">${result.violations?.length || 0}</span>
            </div>
            <div class="report-card-stat">
              Passed: <span class="report-card-stat-value success">${result.passes?.length || 0}</span>
            </div>
          </div>
        </div>

        ${imgPath ? this.generateScreenshotSection(imgPath, result.url) : ''}

        ${
          result.violations && result.violations.length > 0
            ? `
        <div class="violations-section">
          <h4 class="violations-title">
            Violations (${result.violations.length})
          </h4>
          <div>
            ${result.violations
              .map(
                (violation: any) => `
              <div class="violation-item">
                <h5 class="violation-item-id">${this.escapeHtml(violation.id)}</h5>
                <p class="violation-item-desc">${this.escapeHtml(violation.description)}</p>
                <div class="violation-item-meta">
                  <span class="violation-impact">${violation.impact || 'unknown'} impact</span>
                  <a href="${this.escapeHtml(violation.helpUrl)}" target="_blank" class="violation-help">
                    Help: ${this.escapeHtml(violation.help)}
                  </a>
                </div>
                ${
                  violation.nodes && violation.nodes.length > 0
                    ? this.generateCollapsibleCode(violation.nodes, 'problem')
                    : ''
                }
                ${
                  violation.aiExplanation
                    ? `
                <div class="ai-explanation ai-section">
                  <h5 class="ai-section-title">AI Explanation</h5>
                  <div class="ai-section-text">${this.markdownToHtml(violation.aiExplanation)}</div>
                </div>
                `
                    : ''
                }
                ${
                  violation.aiRemediation
                    ? `
                <div class="ai-remediation ai-section">
                  <h5 class="ai-section-title">Solution</h5>
                  <div class="ai-section-text">${this.markdownToHtml(violation.aiRemediation)}</div>
                </div>
                `
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        </div>
        `
            : ''
        }

        ${
          result.passes && result.passes.length > 0
            ? `
        <div class="passed-checks-section">
          <h4 class="passed-checks-title">
            Passed Checks (${result.passes.length})
          </h4>
          <div class="passed-checks-grid">
            ${result.passes
              .slice(0, 12)
              .map(
                (pass: any) => `
              <div class="passed-check-item">
                <div class="passed-check-id">${this.escapeHtml(pass.id)}</div>
                <div class="passed-check-desc">${this.escapeHtml(pass.description || '')}</div>
              </div>
            `
              )
              .join('')}
            ${
              result.passes.length > 12
                ? `
            <div class="passed-check-more">
              <span class="passed-check-more-text">+${result.passes.length - 12} more</span>
            </div>
            `
                : ''
            }
          </div>
        </div>
        `
            : ''
        }
      </div>
    `;
      })
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
      <div class="passed-checks-grid">
        ${allPassed
          .map(
            (pass) => `
          <div class="passed-check-item">
            <h4 class="passed-check-id">${pass.id}</h4>
            <p class="passed-check-desc">${pass.description}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  static generateTestPassedChecksSection(passes: any[]): string {
    if (!passes || passes.length === 0) {
      return '<div style="display: none;"></div>';
    }

    return `
      <div class="passed-checks-grid">
        ${passes
          .map(
            (pass) => `
          <div class="passed-check-item">
            <h4 class="passed-check-id">${pass.id}</h4>
            <p class="passed-check-desc">${pass.description}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  static generatePageResults(results: any[]): string {
    if (!results || results.length === 0) {
      return '<div class="page-result"><p class="text-center text-gray">No test results found</p></div>';
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
          result.screenshot
            ? (() => {
                const imgPath = this.extractScreenshotPath(result.screenshot);
                return this.generateScreenshotSection(imgPath, result.url);
              })()
            : ''
        }

        ${
          result.violations && result.violations.length > 0
            ? `
          <div class="violations-section mb-1">
            <h4 class="violations-title">Violations (${result.violations.length})</h4>
            <div>
              ${result.violations
                .map(
                  (violation: any) => `
                <div class="violation">
                  <h5 class="violation-title">${violation.id}</h5>
                  <p class="violation-desc">${violation.description}</p>
                  <div class="mt-1">
                    <span class="violation-impact">${violation.impact || 'unknown'} impact</span>
                  </div>
                  ${
                    violation.nodes && violation.nodes.length > 0
                      ? this.generateCollapsibleCode(violation.nodes, 'problem')
                      : ''
                  }
                  ${
                    violation.userStory
                      ? `
                    <div class="ai-explanation ai-section">
                      <h5 class="ai-section-title">User Story</h5>
                      <div class="ai-section-text">${this.escapeHtml(violation.userStory)}</div>
                    </div>
                  `
                      : ''
                  }
                  ${
                    violation.aiExplanation
                      ? `
                    <div class="ai-explanation ai-section">
                      <h5 class="ai-section-title">AI Explanation</h5>
                      <div class="ai-section-text">${this.markdownToHtml(violation.aiExplanation)}</div>
                    </div>
                  `
                      : ''
                  }
                  ${
                    violation.aiRemediation
                      ? `
                    <div class="ai-remediation ai-section">
                      <h5 class="ai-section-title">Solution</h5>
                      <div class="ai-section-text">${this.markdownToHtml(violation.aiRemediation)}</div>
                    </div>
                  `
                      : ''
                  }
                </div>
              `
                )
                .join('')}
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
          <div class="passed-checks-section">
            <h4 class="passed-checks-title">Passed Checks (${result.passes.length})</h4>
            <div class="passed-checks-grid">
              ${result.passes
                .slice(0, 8)
                .map(
                  (pass: any) => `
                <div class="passed-check-item">
                  <h5 class="passed-check-id">${pass.id}</h5>
                </div>
              `
                )
                .join('')}
              ${
                result.passes.length > 8
                  ? `
                <div class="passed-check-more">
                  <span class="passed-check-more-text">+${result.passes.length - 8} more</span>
                </div>
              `
                  : ''
              }
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
