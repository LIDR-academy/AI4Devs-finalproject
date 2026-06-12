import request from 'supertest';
import express from 'express';
import app from '../app';

describe('US-000-TASK-05: Middleware stack', () => {
  describe('error handler', () => {
    it('returns generic error without stack trace for unknown route', async () => {
      const res = await request(app).get('/nonexistent-route');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body).not.toHaveProperty('stack');
    });

    it('returns JSON error body for unknown route', async () => {
      const res = await request(app).get('/api/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.error).toBeTruthy();
    });
  });

  describe('CORS middleware', () => {
    it('sets Access-Control-Allow-Origin header', async () => {
      const res = await request(app)
        .get('/nonexistent-route')
        .set('Origin', 'http://localhost:3000');
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('rate limiter', () => {
    it('returns 429 after exceeding mutation limit', async () => {
      // Create a test app with mutationLimiter applied to a test route
      // We test rate limiting behaviour by making 21 rapid requests
      const testApp = express();
      const { mutationLimiter } = await import('../middleware/rate-limit');
      testApp.use(mutationLimiter);
      testApp.post('/test', (_req, res) => res.json({ ok: true }));

      const requests = Array.from({ length: 21 }, () =>
        request(testApp).post('/test')
      );
      const responses = await Promise.all(requests);
      const tooMany = responses.filter(r => r.status === 429);
      expect(tooMany.length).toBeGreaterThan(0);
    });
  });
});
