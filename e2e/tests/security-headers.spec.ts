import { test, expect } from '@playwright/test';

test.describe('US-016-TASK-05: Security headers en frontend (Next.js)', () => {
  test('GET / incluye Content-Security-Policy', async ({ request }) => {
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
  });

  test('GET / incluye X-Frame-Options: DENY', async ({ request }) => {
    const response = await request.get('/');
    expect(response.headers()['x-frame-options']).toBe('DENY');
  });

  test('GET / incluye X-Content-Type-Options: nosniff', async ({ request }) => {
    const response = await request.get('/');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('GET / incluye Referrer-Policy', async ({ request }) => {
    const response = await request.get('/');
    expect(response.headers()['referrer-policy']).toBeDefined();
  });
});
