import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../data-source';

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

describe('UserController', () => {
    let sessionId: string;

    beforeEach(() => {
        sessionId = `test-session-id-${Date.now()}`;
    });

    it('should create a new user', async () => {
        const response = await request(app)
            .post('/users')
            .send({ sessionId: sessionId });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('sessionId', sessionId);
    });

    it('should get a user by session ID', async () => {
        // First, create a user to ensure there is one in the database
        await request(app)
            .post('/users')
            .send({ sessionId: sessionId });

        const response = await request(app)
            .get('/users')
            .set('Cookie', ['sessionId=' + sessionId]);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('sessionId', sessionId);
    });

    it('should return 400 if session ID is missing', async () => {
        const response = await request(app).get('/users');
        expect(response.status).toBe(400);
    });

    it('should get a user by ID', async () => {
        // First, create a user to ensure there is one in the database
        const createUserResponse = await request(app)
            .post('/users')
            .send({ sessionId: sessionId });

        const userId = createUserResponse.body.id;

        const response = await request(app).get(`/users/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', userId);
    });
});