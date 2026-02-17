import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { reservationService } from './reservation.service';
import {
    createReservationRequestSchema,
    CreateReservationRequest,
    ReservationResponse,
} from './reservation.schemas';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorize.middleware';

export async function reservationRoutes(fastify: FastifyInstance) {
    /**
     * POST /api/v1/reservations
     * Create a new reservation (authenticated users)
     */
    fastify.post<{
        Body: CreateReservationRequest;
        Reply: ReservationResponse;
    }>(
        '/reservations',
        {
            preHandler: [authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['courtId', 'startTime', 'endTime'],
                    properties: {
                        courtId: { type: 'string', format: 'uuid' },
                        startTime: { type: 'string', format: 'date-time' },
                        endTime: { type: 'string', format: 'date-time' },
                    },
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            courtId: { type: 'string' },
                            userId: { type: 'string' },
                            startTime: { type: 'string' },
                            endTime: { type: 'string' },
                            status: { type: 'string' },
                            createdAt: { type: 'string' },
                            court: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: CreateReservationRequest }>, reply: FastifyReply) => {
            // Validate request body with Zod
            const { courtId, startTime, endTime } = createReservationRequestSchema.parse(request.body);

            // Get user ID from JWT token
            const user = request.user as { id: string; email: string; role: string };

            // Create reservation
            const reservation = await reservationService.createReservation(
                user.id,
                courtId,
                startTime,
                endTime
            );

            return reply.status(201).send(reservation);
        }
    );

    /**
     * GET /api/v1/reservations/my
     * Get current user's reservations (authenticated users)
     */
    fastify.get<{
        Reply: ReservationResponse[];
    }>(
        '/reservations/my',
        {
            preHandler: [authenticate],
            schema: {
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                courtId: { type: 'string' },
                                userId: { type: 'string' },
                                startTime: { type: 'string' },
                                endTime: { type: 'string' },
                                status: { type: 'string' },
                                createdAt: { type: 'string' },
                                court: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        name: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            // Get user ID from JWT token
            const user = request.user as { id: string; email: string; role: string };

            // Get user's reservations
            const reservations = await reservationService.getUserReservations(user.id);

            return reply.status(200).send(reservations);
        }
    );

    /**
     * GET /api/v1/reservations
     * Get all reservations (ADMIN only)
     */
    fastify.get<{
        Reply: ReservationResponse[];
    }>(
        '/reservations',
        {
            preHandler: [authenticate, authorize(['ADMIN'])],
            schema: {
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                courtId: { type: 'string' },
                                userId: { type: 'string' },
                                startTime: { type: 'string' },
                                endTime: { type: 'string' },
                                status: { type: 'string' },
                                createdAt: { type: 'string' },
                                court: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        name: { type: 'string' },
                                    },
                                },
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        email: { type: 'string' },
                                        role: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            // Get all reservations (admin only)
            const reservations = await reservationService.getAllReservations();

            return reply.status(200).send(reservations);
        }
    );
}
