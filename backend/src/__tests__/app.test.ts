import request from 'supertest';
import app from '../app';
import { AppDataSource } from '../data-source';

beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
});

afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

describe('GET /users', () => {
  it('should return 400 NOT FOUND', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(400);
  });
});