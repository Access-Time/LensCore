export class CrawlingService {
  async initialize() {
    // Mock implementation
  }

  async crawlWebsite(request: {url: string}) {
    return {
      pages: [
        {
          url: request.url,
          title: 'Test Page',
          description: 'Test description',
          statusCode: 200,
          timestamp: new Date().toISOString(),
        },
      ],
      totalPages: 1,
      crawlTime: 1000,
    };
  }

  async close() {
    // Mock implementation
  }
}
