export class AccessibilityService {
  async initialize() {
    // Mock implementation - no browser needed
    return Promise.resolve();
  }

  async testAccessibility(request: any) {
    // Mock implementation - return success result without browser
    return {
      url: request.url,
      score: 85,
      violations: [],
      timestamp: new Date().toISOString(),
    };
  }

  async testMultiplePages(requests: any[]) {
    // Mock implementation - return success results without browser
    return requests.map((request) => ({
      url: request.url,
      score: 85,
      violations: [],
      timestamp: new Date().toISOString(),
    }));
  }

  async close() {
    // Mock implementation - no cleanup needed
    return Promise.resolve();
  }
}
