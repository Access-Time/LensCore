import request from 'supertest';
import app from '../../src/api';

describe('API Endpoints', () => {
  afterAll(async () => {
    // Ensure any async operations are completed
    await new Promise((resolve) => setImmediate(resolve));
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('POST /api/crawl', () => {
    it('should crawl a website', async () => {
      const response = await request(app)
        .post('/api/crawl')
        .send({
          url: 'https://example.com',
          maxUrls: 1,
        })
        .expect(200);

      expect(response.body).toHaveProperty('pages');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('crawlTime');
    });

    it('should validate request data', async () => {
      const response = await request(app)
        .post('/api/crawl')
        .send({
          url: 'invalid-url',
        })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('POST /api/test', () => {
    it('should test accessibility', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({
          url: 'https://example.com',
          includeScreenshot: false,
        })
        .expect(200);

      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('violations');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
