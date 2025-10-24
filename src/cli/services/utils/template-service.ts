/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

export class TemplateService {
  static createFallbackTemplates(templatesDir: string): void {
    try {
      fs.mkdirSync(templatesDir, { recursive: true });

      const templates = {
        'scan-results.html': this.getBasicScanTemplate(),
        'crawl-results.html': this.getBasicCrawlTemplate(),
        'test-results.html': this.getBasicTestTemplate(),
        'test-multiple-results.html': this.getBasicTestMultipleTemplate(),
      };

      for (const [filename, content] of Object.entries(templates)) {
        const filePath = path.join(templatesDir, filename);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, content, 'utf8');
        }
      }

      console.log(`✅ Created fallback templates in ${templatesDir}`);
    } catch (error) {
      console.error(`❌ Failed to create fallback templates: ${error}`);
    }
  }

  private static getBasicScanTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LensCore Scan Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .stat h3 { margin: 0 0 10px 0; color: #495057; }
        .stat p { margin: 0; font-size: 24px; font-weight: bold; color: #007bff; }
        .violations { background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .passed { background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        .violation-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #dc3545; }
        .passed-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 LensCore Scan Results</h1>
            <p>Scan completed at: {{SCAN_TIME}}</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <h3>Total Pages</h3>
                <p>{{TOTAL_PAGES}}</p>
            </div>
            <div class="stat">
                <h3>Passed Checks</h3>
                <p>{{PASSED_CHECKS}}</p>
            </div>
            <div class="stat">
                <h3>Violations</h3>
                <p>{{VIOLATIONS}}</p>
            </div>
        </div>

        {{VIOLATIONS_SECTION}}
        {{PASSED_CHECKS_SECTION}}
    </div>
</body>
</html>`;
  }

  private static getBasicCrawlTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LensCore Crawl Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; }
        th, td { border: 1px solid #dee2e6; padding: 12px; text-align: left; }
        th { background: #f8f9fa; font-weight: 600; color: #495057; }
        tr:nth-child(even) { background: #f8f9fa; }
        tr:hover { background: #e9ecef; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🕷️ LensCore Crawl Results</h1>
            <p>Crawl completed at: {{CRAWL_TIME}}</p>
        </div>
        
        <h2>Discovered Pages</h2>
        {{CRAWL_TABLE_ROWS}}
    </div>
</body>
</html>`;
  }

  private static getBasicTestTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LensCore Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
        .violations { background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .passed { background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        .violation-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #dc3545; }
        .passed-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>♿ LensCore Test Results</h1>
            <p>Test completed at: {{TEST_TIME}}</p>
        </div>
        
        {{VIOLATIONS_SECTION}}
        {{PASSED_CHECKS_SECTION}}
    </div>
</body>
</html>`;
  }

  private static getBasicTestMultipleTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LensCore Multiple Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
        .url-section { margin: 20px 0; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; background: #f8f9fa; }
        .url-section h3 { margin-top: 0; color: #495057; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>♿ LensCore Multiple Test Results</h1>
            <p>Tests completed at: {{TEST_TIME}}</p>
        </div>
        
        {{MULTIPLE_TEST_SECTIONS}}
    </div>
</body>
</html>`;
  }
}
