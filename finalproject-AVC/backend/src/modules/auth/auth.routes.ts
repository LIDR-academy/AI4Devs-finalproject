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

            return reply.status(200).send({ token });
        }
    );
}
