/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import { PathResolverService } from './utils/path-resolver';
import { DataProcessorService } from './utils/data-processor';
import { HtmlGeneratorService } from './utils/html-generator';
import { FileService } from './utils/file-service';

export class WebReportService {
  private templatesDir: string;
  private outputDir: string;

  constructor() {
    this.templatesDir = PathResolverService.findTemplatesDirectory();
    this.outputDir = PathResolverService.findOutputDirectory();

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  generateScanReport(scanData: any): string {
    const templatePath = path.join(this.templatesDir, 'scan-results.html');
    const template = fs.readFileSync(templatePath, 'utf8');

    let html = template;

    const totalPages = String(scanData.crawl?.totalPages || 0);
    const passedChecks = String(
      DataProcessorService.getTotalPassedChecks(scanData)
    );
    const violations = String(
      DataProcessorService.getTotalViolations(scanData)
    );
    const scanTimeMs = String(scanData.totalTime || 0);
    const scanTime = new Date().toLocaleString();

    html = html.replace(/\{\{TOTAL_PAGES\}\}/g, totalPages);
    html = html.replace(/\{\{PASSED_CHECKS\}\}/g, passedChecks);
    html = html.replace(/\{\{VIOLATIONS\}\}/g, violations);
    html = html.replace(/\{\{SCAN_TIME_MS\}\}/g, scanTimeMs);
    html = html.replace(/\{\{SCAN_TIME\}\}/g, scanTime);

    html = html.replace(
      /\{\{CRAWL_TABLE_ROWS\}\}/g,
      HtmlGeneratorService.generateCrawlTableRows(scanData.crawl?.pages || [])
    );

    html = html.replace(
      /\{\{VIOLATIONS_SECTION\}\}/g,
      HtmlGeneratorService.generateViolationsSection(
        scanData.accessibility?.results || []
      )
    );

    html = html.replace(
      /\{\{PASSED_CHECKS_SECTION\}\}/g,
      HtmlGeneratorService.generatePassedChecksSection(
        scanData.accessibility?.results || []
      )
    );

    return FileService.saveHtmlFile(html, 'scan', this.outputDir);
  }

  generateCrawlReport(crawlData: any): string {
    const templatePath = path.join(this.templatesDir, 'crawl-results.html');
    const template = fs.readFileSync(templatePath, 'utf8');

    let html = template;

    const totalPages = String(crawlData.totalPages || 0);
    const successfulPages = String(
      DataProcessorService.getSuccessfulPages(crawlData.pages || [])
    );
    const crawlTimeMs = String(crawlData.crawlTime || 0);
    const crawlTime = new Date().toLocaleString();

    html = html.replace(/\{\{TOTAL_PAGES\}\}/g, totalPages);
    html = html.replace(/\{\{SUCCESSFUL_PAGES\}\}/g, successfulPages);
    html = html.replace(/\{\{CRAWL_TIME_MS\}\}/g, crawlTimeMs);
    html = html.replace(/\{\{CRAWL_TIME\}\}/g, crawlTime);

    html = html.replace(
      /\{\{CRAWL_TABLE_ROWS\}\}/g,
      HtmlGeneratorService.generateCrawlTableRows(crawlData.pages || [])
    );

    return FileService.saveHtmlFile(html, 'crawl', this.outputDir);
  }

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
      HtmlGeneratorService.generateTestViolationsSection(
        testData.violations || []
      )
    );

    html = html.replace(
      /\{\{PASSED_CHECKS_SECTION\}\}/g,
      HtmlGeneratorService.generateTestPassedChecksSection(
        testData.passes || []
      )
    );

    return FileService.saveHtmlFile(html, 'test', this.outputDir);
  }

  generateTestMultipleReport(testData: any): string {
    const templatePath = path.join(
      this.templatesDir,
      'test-multiple-results.html'
    );
    const template = fs.readFileSync(templatePath, 'utf8');

    let html = template;

    const totalPages = String(testData.totalPages || 0);
    const totalPassed = String(
      DataProcessorService.getTotalPassedChecksMultiple(testData.results || [])
    );
    const totalViolations = String(
      DataProcessorService.getTotalViolationsMultiple(testData.results || [])
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
      HtmlGeneratorService.generatePageResults(testData.results || [])
    );

    return FileService.saveHtmlFile(html, 'test-multiple', this.outputDir);
  }

  getWebUrl(filename: string, port: number): string {
    return FileService.getWebUrl(filename, port);
  }

  cleanupOldReports(maxAge: number = 24 * 60 * 60 * 1000): void {
    FileService.cleanupOldReports(this.outputDir, maxAge);
  }
}
