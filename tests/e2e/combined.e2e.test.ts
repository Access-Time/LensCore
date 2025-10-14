import request from 'supertest';

let uploadSpy: jest.Mock;

jest.mock('../../src/storage', () => {
  uploadSpy = jest.fn().mockResolvedValue('mock://uploaded/screenshot.png');
  return {
    createStorageService: () => ({
      uploadFile: uploadSpy,
      downloadFile: jest.fn(),
      deleteFile: jest.fn(),
      getFileUrl: jest.fn(),
      cleanup: jest.fn(),
    }),
  };
});

describe('/api/combined integration', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns combined results and uploads screenshot via storage', async () => {
    jest.doMock('../../src/services/crawling', () => ({
      CrawlingService: class {
        async initialize() {}
        async crawlWebsite() {
          return {
            pages: [
              {
                url: 'https://example.com',
                title: 't',
                description: 'd',
                statusCode: 200,
                timestamp: new Date(),
              },
            ],
            totalPages: 1,
            crawlTime: 10,
          };
        }
        async close() {}
      },
    }));

    jest.doMock('../../src/services/accessibility', () => ({
      AccessibilityService: class {
        async initialize() {}
        async testMultiplePages(requests: Array<{ url: string }>) {
          await uploadSpy('/tmp/file.png', 'screenshots/x.png');
          return {
            results: requests.map((r: { url: string }) => ({
              url: r.url,
              score: 90,
              violations: [],
              passes: [],
              incomplete: [],
              inapplicable: [],
              screenshot: 'mock://uploaded/screenshot.png',
              timestamp: new Date(),
            })),
            totalPages: requests.length,
            testTime: 10,
          };
        }
        async close() {}
      },
    }));

    const app = (await import('../../src/api')).default;

    const res = await request(app)
      .post('/api/combined')
      .send({ url: 'https://example.com' })
      .expect(200);

    expect(res.body).toHaveProperty('crawl');
    expect(res.body).toHaveProperty('accessibility');
    expect(res.body.accessibility.results[0]).toHaveProperty('screenshot');
    expect(uploadSpy).toHaveBeenCalledTimes(1);
  });

  it('returns 400 on validation error', async () => {
    const app = (await import('../../src/api')).default;

    const res = await request(app)
      .post('/api/combined')
      .send({ url: 'not-a-url' })
      .expect(400);

    expect(res.body).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('returns 500 when crawl fails upstream', async () => {
    jest.doMock('../../src/services/crawling', () => ({
      CrawlingService: class {
        async initialize() {}
        async crawlWebsite() {
          throw new Error('crawl failed');
        }
        async close() {}
      },
    }));

    jest.doMock('../../src/services/accessibility', () => ({
      AccessibilityService: class {
        async initialize() {}
        async testMultiplePages() {
          return { results: [], totalPages: 0, testTime: 0 };
        }
        async close() {}
      },
    }));

    const app = (await import('../../src/api')).default;

    await request(app)
      .post('/api/combined')
      .send({ url: 'https://example.com' })
      .expect(500);
  });

  it('returns 500 on accessibility timeout error', async () => {
    jest.doMock('../../src/services/crawling', () => ({
      CrawlingService: class {
        async initialize() {}
        async crawlWebsite() {
          return {
            pages: [
              {
                url: 'https://example.com',
                title: 't',
                description: 'd',
                statusCode: 200,
                timestamp: new Date(),
              },
            ],
            totalPages: 1,
            crawlTime: 10,
          };
        }
        async close() {}
      },
    }));

    jest.doMock('../../src/services/accessibility', () => ({
      AccessibilityService: class {
        async initialize() {}
        async testMultiplePages() {
          throw new Error('Timeout');
        }
        async close() {}
      },
    }));

    const app = (await import('../../src/api')).default;

    await request(app)
      .post('/api/combined')
      .send({ url: 'https://example.com' })
      .expect(500);
  });
});
