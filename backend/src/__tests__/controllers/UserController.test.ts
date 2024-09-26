import request from 'supertest';
import app from '../../app';

describe('UserController', () => {
    let sessionId: string;

    beforeEach(() => {
        sessionId = `test-session-id-${Date.now()}-${Math.random()}}`;
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
        await request(app)
            .post('/users')
            .send({ sessionId: sessionId });

        const response = await request(app)
            .get('/users')
            .set('X-Session-Id', sessionId);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('sessionId', sessionId);
    });

    it('should return 400 if session ID is missing', async () => {
        const response = await request(app).get('/users');
        expect(response.status).toBe(400);
    });

    it('should get a user by ID', async () => {
        const createUserResponse = await request(app)
            .post('/users')
            .send({ sessionId: sessionId });

        const userId = createUserResponse.body.id;

        const response = await request(app).get(`/users/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', userId);
    });
});