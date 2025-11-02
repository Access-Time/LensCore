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
    const bgColor = isProblem ? '#fef3c7' : '#d1fae5';
    const borderColor = isProblem ? '#f59e0b' : '#10b981';
    const textColor = isProblem ? '#78350f' : '#065f46';

    return `
      <details style="margin-top: 1rem; background: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 0.375rem; overflow: hidden;">
        <summary style="padding: 1rem; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; font-weight: 600; color: ${textColor}; list-style: none; user-select: none; word-break: break-word;">
          <span>${icon} ${title}</span>
          <span style="transition: transform 0.3s ease; flex-shrink: 0; margin-left: 0.5rem;">▼</span>
        </summary>
        <div style="padding: 0 1rem 1rem 1rem; word-break: break-word; overflow-wrap: break-word;">
          ${nodes
            .map(
              (node: any, idx: number) => `
            <div style="margin-bottom: ${idx < nodes.length - 1 ? '1rem' : '0'};">
              ${node.target ? `<div style="font-size: 0.75rem; color: ${isProblem ? '#92400e' : '#065f46'}; font-family: monospace; margin-bottom: 0.25rem; word-break: break-word;">Target: ${node.target.join(' > ')}</div>` : ''}
              <div style="background: #1f2937; color: #f9fafb; padding: 0.75rem; border-radius: 0.375rem; overflow-x: auto; font-size: 0.875rem; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; line-height: 1.5; max-width: 100%;">
                <pre style="margin: 0; white-space: pre; word-spacing: normal; tab-size: 2; word-wrap: break-word; overflow-x: auto;">${this.escapeHtml(this.formatHtml(node.html))}</pre>
              </div>
              ${node.failureSummary ? `<div style="margin-top: 0.5rem; font-size: 0.75rem; color: ${isProblem ? '#92400e' : '#065f46'}; word-break: break-word;">${this.escapeHtml(node.failureSummary)}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      </details>
      <style>
        details summary::-webkit-details-marker { display: none; }
        details summary::-moz-list-bullet { list-style: none; }
        details[open] summary span:last-child { transform: rotate(-90deg); }
      </style>
    `;
  }

  static generateCrawlTableRows(pages: any[]): string {
    if (!pages || pages.length === 0) {
      return '<tr><td colspan="6" style="text-align: center; color: #6b7280;">No pages found</td></tr>';
    }

    return pages
      .map(
        (page, index) => `
      <tr>
        <td>${index + 1}</td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <a href="${page.url}" target="_blank" class="link" title="${page.url}">
            ${page.url}
          </a>
        </td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${page.title || '-'}">${page.title || '-'}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${page.description || '-'}">${page.description || '-'}</td>
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
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; word-break: break-word;">
              <span class="violation-impact" style="flex-shrink: 0;">${violation.impact || 'unknown'} impact</span>
              <div style="font-size: 0.75rem; color: #6b7280; word-break: break-all; overflow-wrap: anywhere; min-width: 0;">
                URL: <a href="${violation.url}" target="_blank" class="link" style="word-break: break-all; overflow-wrap: anywhere; display: inline;">${violation.url}</a>
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
            <div class="ai-explanation" style="margin-top: 0.75rem;">
              <h5 class="ai-explanation-title">User Story</h5>
              <div class="ai-explanation-text">${this.escapeHtml(violation.userStory)}</div>
            </div>
          `
              : ''
          }
          ${
            violation.aiExplanation
              ? `
            <div class="ai-explanation" style="margin-top: 0.75rem;">
              <h5 class="ai-explanation-title">AI Explanation</h5>
              <div class="ai-explanation-text">${this.markdownToHtml(violation.aiExplanation)}</div>
            </div>
          `
              : ''
          }
          ${
            violation.aiRemediation
              ? `
            <div class="ai-remediation" style="margin-top: 0.75rem;">
              <h5 class="ai-remediation-title">Solution</h5>
              <div class="ai-remediation-text">${this.markdownToHtml(violation.aiRemediation)}</div>
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
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; word-break: break-word;">
              <span class="violation-impact" style="flex-shrink: 0;">${violation.impact || 'unknown'} impact</span>
              <div style="font-size: 0.75rem; color: #6b7280; word-break: break-all; overflow-wrap: anywhere; min-width: 0;">
                Help: <a href="${violation.helpUrl}" target="_blank" class="link" style="word-break: break-all; overflow-wrap: anywhere; display: inline;">${violation.help}</a>
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
            <div class="ai-explanation" style="margin-top: 0.75rem;">
              <h5 class="ai-explanation-title">User Story</h5>
              <div class="ai-explanation-text">${this.escapeHtml(violation.userStory)}</div>
            </div>
          `
              : ''
          }
          ${
            violation.aiExplanation
              ? `
            <div class="ai-explanation" style="margin-top: 0.75rem;">
              <h5 class="ai-explanation-title">AI Explanation</h5>
              <div class="ai-explanation-text">${this.markdownToHtml(violation.aiExplanation)}</div>
            </div>
          `
              : ''
          }
          ${
            violation.aiRemediation
              ? `
            <div class="ai-remediation" style="margin-top: 0.75rem;">
              <h5 class="ai-remediation-title">Solution</h5>
              <div class="ai-remediation-text">${this.markdownToHtml(violation.aiRemediation)}</div>
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
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 1rem; font-weight: 500; color: #111827; margin-bottom: 0.75rem;">Screenshot</h4>
        <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; background: #f9fafb;">
          <div style="max-height: 800px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f3f4f6;">
            <img 
              src="${imgPath}" 
              alt="Screenshot of ${this.escapeHtml(url)}" 
              style="max-width: 100%; max-height: 800px; height: auto; width: auto; display: block; object-fit: contain; cursor: pointer;"
              onclick="window.open('${imgPath}', '_blank')"
            />
          </div>
          <div style="padding: 0.75rem; border-top: 1px solid #e5e7eb; background: white;">
            <a href="${imgPath}" target="_blank" style="font-size: 0.875rem; color: #3b82f6; text-decoration: none;">Open full size</a>
          </div>
        </div>
      </div>
    `;
  }

  static generatePageResultsForScan(results: any[]): string {
    if (!results || results.length === 0) {
      return '<div style="text-align: center; color: #6b7280; padding: 2rem;">No accessibility results found</div>';
    }

    return results
      .map((result, index) => {
        const imgPath = result.screenshot
          ? this.extractScreenshotPath(result.screenshot)
          : null;
        return `
      <div class="card" style="margin-bottom: 2rem;">
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">
            Page ${index + 1}
          </h3>
          <a href="${this.escapeHtml(result.url)}" target="_blank" style="font-size: 0.875rem; color: #3b82f6; word-break: break-all;">
            ${this.escapeHtml(result.url)}
          </a>
          <div style="display: flex; gap: 1rem; margin-top: 0.75rem;">
            <div style="font-size: 0.875rem; color: #6b7280;">
              Violations: <span style="font-weight: 500; color: ${result.violations?.length > 0 ? '#f59e0b' : '#10b981'}">${result.violations?.length || 0}</span>
            </div>
            <div style="font-size: 0.875rem; color: #6b7280;">
              Passed: <span style="font-weight: 500; color: #10b981">${result.passes?.length || 0}</span>
            </div>
          </div>
        </div>

        ${imgPath ? this.generateScreenshotSection(imgPath, result.url) : ''}

        ${
          result.violations && result.violations.length > 0
            ? `
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; font-weight: 500; color: #111827; margin-bottom: 0.75rem;">
            Violations (${result.violations.length})
          </h4>
          <div>
            ${result.violations
              .map(
                (violation: any) => `
              <div style="border: 1px solid rgba(245, 158, 11, 0.2); background: rgba(245, 158, 11, 0.05); border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem;">
                <h5 style="font-size: 0.875rem; font-weight: 500; color: #111827; margin-bottom: 0.25rem;">${this.escapeHtml(violation.id)}</h5>
                <p style="font-size: 0.8125rem; color: #6b7280; margin-bottom: 0.5rem;">${this.escapeHtml(violation.description)}</p>
                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                  <span style="display: inline-flex; align-items: center; padding: 0.25rem 0.5rem; border-radius: 9999px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; font-size: 0.75rem;">
                    ${violation.impact || 'unknown'} impact
                  </span>
                  <a href="${this.escapeHtml(violation.helpUrl)}" target="_blank" style="font-size: 0.75rem; color: #3b82f6;">
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
                <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(59, 130, 246, 0.05); border-radius: 0.5rem; border-left: 3px solid #3b82f6;">
                  <div style="font-size: 0.75rem; font-weight: 500; color: #3b82f6; margin-bottom: 0.25rem;">AI Explanation</div>
                  <div style="font-size: 0.8125rem; color: #111827;">${this.markdownToHtml(violation.aiExplanation)}</div>
                </div>
                `
                    : ''
                }
                ${
                  violation.aiRemediation
                    ? `
                <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(16, 185, 129, 0.05); border-radius: 0.5rem; border-left: 3px solid #10b981;">
                  <div style="font-size: 0.75rem; font-weight: 500; color: #10b981; margin-bottom: 0.25rem;">Solution</div>
                  <div style="font-size: 0.8125rem; color: #111827;">${this.markdownToHtml(violation.aiRemediation)}</div>
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
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; font-weight: 500; color: #111827; margin-bottom: 0.75rem;">
            Passed Checks (${result.passes.length})
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
            ${result.passes
              .slice(0, 12)
              .map(
                (pass: any) => `
              <div style="border: 1px solid rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.05); border-radius: 0.5rem; padding: 0.75rem;">
                <div style="font-size: 0.8125rem; font-weight: 500; color: #111827; margin-bottom: 0.25rem;">${this.escapeHtml(pass.id)}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">${this.escapeHtml(pass.description || '')}</div>
              </div>
            `
              )
              .join('')}
            ${
              result.passes.length > 12
                ? `
            <div style="border: 1px solid #e5e7eb; background: #f9fafb; border-radius: 0.5rem; padding: 0.75rem; text-align: center; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 0.75rem; color: #6b7280;">+${result.passes.length - 12} more</span>
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
          <div style="margin-bottom: 1rem;">
            <h4 style="font-size: 0.875rem; font-weight: 500; color: #111827; margin-bottom: 0.5rem;">Violations (${result.violations.length})</h4>
            <div>
              ${result.violations
                .map(
                  (violation: any) => `
                <div class="violation">
                  <h5 class="violation-title">${violation.id}</h5>
                  <p class="violation-desc">${violation.description}</p>
                  <div style="margin-top: 0.25rem;">
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
                    <div class="ai-explanation" style="margin-top: 0.75rem;">
                      <h5 class="ai-explanation-title">User Story</h5>
                      <div class="ai-explanation-text">${this.escapeHtml(violation.userStory)}</div>
                    </div>
                  `
                      : ''
                  }
                  ${
                    violation.aiExplanation
                      ? `
                    <div class="ai-explanation" style="margin-top: 0.75rem;">
                      <h5 class="ai-explanation-title">AI Explanation</h5>
                      <div class="ai-explanation-text">${this.markdownToHtml(violation.aiExplanation)}</div>
                    </div>
                  `
                      : ''
                  }
                  ${
                    violation.aiRemediation
                      ? `
                    <div class="ai-remediation" style="margin-top: 0.75rem;">
                      <h5 class="ai-remediation-title">Solution</h5>
                      <div class="ai-remediation-text">${this.markdownToHtml(violation.aiRemediation)}</div>
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
      </div>
    `
      )
      .join('');
  }
}
