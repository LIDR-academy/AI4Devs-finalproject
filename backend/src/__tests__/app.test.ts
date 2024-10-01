import request from 'supertest';
import app from '../app';

describe('GET /users', () => {
  it('should return 400 NOT FOUND', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(400);
  });
});