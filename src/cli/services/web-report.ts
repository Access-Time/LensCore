/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { PathResolverService } from './utils/path-resolver';
import { DataProcessorService } from './utils/data-processor';
import { HtmlGeneratorService } from './utils/html-generator';
import { FileService } from './utils/file-service';

export class WebReportService {
  private templatesDir: string;
  private outputDir: string;
  private static helpersRegistered = false;
  private static templateCache = new Map<string, HandlebarsTemplateDelegate>();

  constructor() {
    this.templatesDir = PathResolverService.findTemplatesDirectory();
    this.outputDir = PathResolverService.findOutputDirectory();

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    WebReportService.ensureHelpersRegistered();
  }

  private static ensureHelpersRegistered(): void {
    if (this.helpersRegistered) return;

    Handlebars.registerHelper('crawlTableRows', (pages: any[]) => {
      return new Handlebars.SafeString(
        HtmlGeneratorService.generateCrawlTableRows(pages || [])
      );
    });

    Handlebars.registerHelper('violationsSection', (results: any[]) => {
      return new Handlebars.SafeString(
        HtmlGeneratorService.generateViolationsSection(results || [])
      );
    });

    Handlebars.registerHelper('passedChecksSection', (results: any[]) => {
      return new Handlebars.SafeString(
        HtmlGeneratorService.generatePassedChecksSection(results || [])
      );
    });

    Handlebars.registerHelper('pageResultsForScan', (results: any[]) => {
      return new Handlebars.SafeString(
        HtmlGeneratorService.generatePageResultsForScan(results || [])
      );
    });

    Handlebars.registerHelper('extractScreenshotPath', (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      if (url.startsWith('gs://')) {
        const parts = url.split('/');
        return `/storage/screenshots/${parts[parts.length - 1]}`;
      }
      if (url.includes('screenshots/')) {
        const parts = url.split('screenshots/');
        return `/storage/screenshots/${parts[parts.length - 1]}`;
      }
      if (url.includes('/')) {
        const parts = url.split('/');
        return `/storage/screenshots/${parts[parts.length - 1]}`;
      }
      return `/storage/screenshots/${url}`;
    });

    Handlebars.registerHelper('testViolationsSection', (violations: any[]) => {
      return new Handlebars.SafeString(
        HtmlGeneratorService.generateTestViolationsSection(violations || [])
      );
    });

    Handlebars.registerHelper('testPassedChecksSection', (passes: any[]) => {
      return new Handlebars.SafeString(
        HtmlGeneratorService.generateTestPassedChecksSection(passes || [])
      );
    });

    Handlebars.registerHelper('pageResults', (results: any[]) => {
      return new Handlebars.SafeString(
        HtmlGeneratorService.generatePageResults(results || [])
      );
    });

    this.helpersRegistered = true;
  }

  private getCompiledTemplate(
    templateName: string
  ): HandlebarsTemplateDelegate {
    const cacheKey = templateName;

    if (WebReportService.templateCache.has(cacheKey)) {
      return WebReportService.templateCache.get(cacheKey)!;
    }

    const templatePath = path.join(this.templatesDir, templateName);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(templateSource);

    WebReportService.templateCache.set(cacheKey, compiled);
    return compiled;
  }

  private generateReport(
    templateName: string,
    data: any,
    outputPrefix: string
  ): string {
    const template = this.getCompiledTemplate(templateName);
    const html = template(data);
    return FileService.saveHtmlFile(html, outputPrefix, this.outputDir);
  }

  generateScanReport(scanData: any): string {
    const data = {
      TOTAL_PAGES: scanData.crawl?.totalPages || 0,
      PASSED_CHECKS: DataProcessorService.getTotalPassedChecks(scanData),
      VIOLATIONS: DataProcessorService.getTotalViolations(scanData),
      SCAN_TIME_MS: scanData.totalTime || 0,
      SCAN_TIME: new Date().toLocaleString(),
      crawlPages: scanData.crawl?.pages || [],
      accessibilityResults: scanData.accessibility?.results || [],
    };

    return this.generateReport('scan-results.html', data, 'scan');
  }

  generateCrawlReport(crawlData: any): string {
    const data = {
      TOTAL_PAGES: crawlData.totalPages || 0,
      SUCCESSFUL_PAGES: DataProcessorService.getSuccessfulPages(
        crawlData.pages || []
      ),
      CRAWL_TIME_MS: crawlData.crawlTime || 0,
      CRAWL_TIME: new Date().toLocaleString(),
      pages: crawlData.pages || [],
    };

    return this.generateReport('crawl-results.html', data, 'crawl');
  }

  generateTestReport(testData: any, testUrl: string): string {
    const data = {
      TEST_URL: testUrl,
      SCORE: testData.score || 'N/A',
      PASSED_CHECKS: testData.passes?.length || 0,
      VIOLATIONS: testData.violations?.length || 0,
      SCREENSHOT_STATUS: testData.screenshot ? 'Available' : 'Not available',
      SCREENSHOT_URL: testData.screenshot || null,
      TEST_TIME: new Date().toLocaleString(),
      violations: testData.violations || [],
      passes: testData.passes || [],
    };

    return this.generateReport('test-results.html', data, 'test');
  }

  generateTestMultipleReport(testData: any): string {
    const data = {
      TOTAL_PAGES: testData.totalPages || 0,
      TOTAL_PASSED: DataProcessorService.getTotalPassedChecksMultiple(
        testData.results || []
      ),
      TOTAL_VIOLATIONS: DataProcessorService.getTotalViolationsMultiple(
        testData.results || []
      ),
      TEST_TIME_MS: testData.testTime || 0,
      TEST_TIME: new Date().toLocaleString(),
      results: testData.results || [],
    };

    return this.generateReport(
      'test-multiple-results.html',
      data,
      'test-multiple'
    );
  }

  getWebUrl(filename: string, port: number): string {
    return FileService.getWebUrl(filename, port);
  }

  cleanupOldReports(maxAge: number = 24 * 60 * 60 * 1000): void {
    FileService.cleanupOldReports(this.outputDir, maxAge);
  }
}
