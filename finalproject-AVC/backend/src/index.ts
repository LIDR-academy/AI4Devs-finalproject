import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './shared/config';
import { errorHandler } from './shared/errors/error-handler';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';

const fastify = Fastify({
    logger: {
        level: config.nodeEnv === 'production' ? 'info' : 'debug',
    },
});

// Register plugins
fastify.register(cors, {
    origin: config.corsOrigin,
});

fastify.register(jwt, {
    secret: config.jwtSecret,
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/v1/auth' });
fastify.register(userRoutes, { prefix: '/api/v1/auth' });

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

// Start server
const start = async () => {
    try {
        await fastify.listen({
            port: config.port,
            host: config.host,
        });
        console.log(`🚀 Server running on http://${config.host}:${config.port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

export { fastify };
