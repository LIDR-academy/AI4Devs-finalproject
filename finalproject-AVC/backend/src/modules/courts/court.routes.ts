import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { courtService } from './court.service';
import {
    createCourtRequestSchema,
    CreateCourtRequest,
    CourtResponse,
    availabilityQuerySchema,
    AvailabilityQuery,
    TimeSlot,
} from './court.schemas';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorize.middleware';

export async function courtRoutes(fastify: FastifyInstance) {
    /**
     * GET /api/v1/courts
     * List all active courts (public endpoint)
     */
    fastify.get<{
        Reply: CourtResponse[];
    }>(
        '/courts',
        {
            schema: {
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                active: { type: 'boolean' },
                                createdAt: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            const courts = await courtService.listCourts();
            return reply.status(200).send(courts);
        }
    );

    /**
     * POST /api/v1/courts
     * Create a new court (ADMIN only)
     */
    fastify.post<{
        Body: CreateCourtRequest;
        Reply: CourtResponse;
    }>(
        '/courts',
        {
            preHandler: [authenticate, authorize(['ADMIN'])],
            schema: {
                body: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            active: { type: 'boolean' },
                            createdAt: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: CreateCourtRequest }>, reply: FastifyReply) => {
            // Validate request body with Zod
            const { name } = createCourtRequestSchema.parse(request.body);

            // Create court
            const court = await courtService.createCourt(name);

            return reply.status(201).send(court);
        }
    );

    /**
     * GET /api/v1/courts/:courtId/availability
     * Get court availability for a specific date (public endpoint)
     */
    fastify.get<{
        Params: { courtId: string };
        Querystring: AvailabilityQuery;
        Reply: TimeSlot[];
    }>(
        '/courts/:courtId/availability',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        courtId: { type: 'string', format: 'uuid' },
                    },
                },
                querystring: {
                    type: 'object',
                    required: ['date'],
                    properties: {
                        date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
                    },
                },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                startTime: { type: 'string' },
                                endTime: { type: 'string' },
                                available: { type: 'boolean' },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{
                Params: { courtId: string };
                Querystring: AvailabilityQuery;
            }>,
            reply: FastifyReply
        ) => {
            const { courtId } = request.params;

            // Validate query params with Zod
            const { date } = availabilityQuerySchema.parse(request.query);

            // Get availability
            const availability = await courtService.getCourtAvailability(courtId, date);

            return reply.status(200).send(availability);
        }
    );
}
