import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from '../../src/shared/config';
import { errorHandler } from '../../src/shared/errors/error-handler';

describe('Health Check API', () => {
    let fastify: ReturnType<typeof Fastify>;

    beforeAll(async () => {
        // Create a test instance of Fastify
        fastify = Fastify({ logger: false });

        // Register plugins
        await fastify.register(cors, { origin: config.corsOrigin });
        await fastify.register(jwt, { secret: config.jwtSecret });

        // Health check endpoint
        fastify.get('/api/v1/health', async () => {
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: config.nodeEnv,
            };
        });

        // Error handler
        fastify.setErrorHandler(errorHandler);

        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    it('should return 200 status code', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/api/v1/health',
        });

        expect(response.statusCode).toBe(200);
    });

    it('should return correct response structure', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/api/v1/health',
        });

        const body = JSON.parse(response.body);

        expect(body).toHaveProperty('status');
        expect(body).toHaveProperty('timestamp');
        expect(body).toHaveProperty('environment');
    });

    it('should return status ok', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/api/v1/health',
        });

        const body = JSON.parse(response.body);
        expect(body.status).toBe('ok');
    });

    it('should return valid ISO timestamp', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/api/v1/health',
        });

        const body = JSON.parse(response.body);
        const timestamp = new Date(body.timestamp);
        expect(timestamp.toISOString()).toBe(body.timestamp);
    });

    it('should return environment from config', async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/api/v1/health',
        });

        const body = JSON.parse(response.body);
        expect(body.environment).toBe(config.nodeEnv);
    });
});
