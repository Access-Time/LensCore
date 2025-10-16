import request from 'supertest';

describe('/api/combined integration', () => {
  afterAll(async () => {
    await new Promise(resolve => setImmediate(resolve));
  });

  it('returns combined results', async () => {
    const app = (await import('../../src/api')).default;

    const res = await request(app)
      .post('/api/combined')
      .send({ url: 'https://example.com' })
      .expect(200);

    expect(res.body).toHaveProperty('crawl');
    expect(res.body).toHaveProperty('accessibility');
    expect(res.body).toHaveProperty('totalTime');
  });

  it('returns 400 on validation error', async () => {
    const app = (await import('../../src/api')).default;

    const res = await request(app)
      .post('/api/combined')
      .send({ url: 'not-a-url' })
      .expect(400);

    expect(res.body).toHaveProperty('code', 'VALIDATION_ERROR');
  });
});
