import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { userService } from './user.service';
import { createUserRequestSchema, CreateUserRequest, UserResponse } from './user.schemas';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorize.middleware';

export async function userRoutes(fastify: FastifyInstance) {
    /**
     * POST /api/v1/auth/register
     * Create a new user (ADMIN only)
     */
    fastify.post<{
        Body: CreateUserRequest;
        Reply: UserResponse;
    }>(
        '/register',
        {
            preHandler: [authenticate, authorize(['ADMIN'])],
            schema: {
                body: {
                    type: 'object',
                    required: ['email', 'password', 'role'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 },
                        role: { type: 'string', enum: ['PLAYER', 'ADMIN'] },
                    },
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                            role: { type: 'string' },
                            active: { type: 'boolean' },
                            createdAt: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: CreateUserRequest }>, reply: FastifyReply) => {
            // Validate request body with Zod
            const { email, password, role } = createUserRequestSchema.parse(request.body);

            // Create user
            const user = await userService.createUser(email, password, role);

            return reply.status(201).send(user);
        }
    );
}
