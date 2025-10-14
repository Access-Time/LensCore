import { CrawlingService } from '../../src/services/crawling';
import { AccessibilityService } from '../../src/services/accessibility';

jest.mock('../../src/storage', () => ({
  createStorageService: () => ({
    uploadFile: jest.fn().mockResolvedValue('mock://uploaded/screenshot.png'),
    downloadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileUrl: jest.fn(),
    cleanup: jest.fn(),
  }),
}));

describe('CrawlingService', () => {
  let crawlingService: CrawlingService;

  beforeEach(() => {
    crawlingService = new CrawlingService();
  });

  afterEach(async () => {
    await crawlingService.close();
  });

  it('should crawl a website', async () => {
    const result = await crawlingService.crawlWebsite({
      url: 'https://example.com',
      maxUrls: 1,
    });

    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]).toHaveProperty('url');
    expect(result.pages[0]).toHaveProperty('title');
    expect(result.pages[0]).toHaveProperty('description');
    expect(result.pages[0]).toHaveProperty('statusCode');
    expect(result.pages[0]).toHaveProperty('timestamp');
  });
});

describe('AccessibilityService', () => {
  let accessibilityService: AccessibilityService;

  beforeEach(() => {
    accessibilityService = new AccessibilityService();
  });

  afterEach(async () => {
    await accessibilityService.close();
  });

  it('should test accessibility', async () => {
    const result = await accessibilityService.testAccessibility({
      url: 'https://example.com',
      includeScreenshot: false,
    });

    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('violations');
    expect(result).toHaveProperty('timestamp');
    expect(typeof result.score).toBe('number');
  });
});
