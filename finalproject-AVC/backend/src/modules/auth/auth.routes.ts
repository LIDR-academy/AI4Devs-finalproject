import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './auth.service';
import { loginRequestSchema, LoginRequest, LoginResponse } from './auth.schemas';

export async function authRoutes(fastify: FastifyInstance) {
    /**
     * POST /api/v1/auth/login
     * Authenticate user and return JWT token
     */
    fastify.post<{
        Body: LoginRequest;
        Reply: LoginResponse;
    }>(
        '/login',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
            // Validate request body with Zod
            const { email, password } = loginRequestSchema.parse(request.body);

            // Authenticate user
            const user = await authService.login(email, password);

            // Generate JWT token
            const token = fastify.jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            // Return token AND user data
            return reply.status(200).send({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    active: user.active,
                    createdAt: user.createdAt.toISOString(),
                },
            });
        }
    );

    /**
     * GET /api/v1/auth/me
     * Get current authenticated user
     */
    fastify.get(
        '/me',
        {
            preHandler: [async (request, reply) => {
                try {
                    await request.jwtVerify();
                } catch (err) {
                    reply.status(401).send({ error: 'Unauthorized' });
                }
            }],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as { id: string; email: string; role: string };

            // Fetch full user data from database
            const { PrismaClient } = await import('@prisma/client');
            const prisma = new PrismaClient();

            const userData = await prisma.user.findUnique({
                where: { id: user.id },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    active: true,
                    createdAt: true,
                },
            });

            if (!userData) {
                return reply.status(404).send({ error: 'User not found' });
            }

            return reply.status(200).send({
                id: userData.id,
                email: userData.email,
                role: userData.role,
                active: userData.active,
                createdAt: userData.createdAt.toISOString(),
            });
        }
    );
}
