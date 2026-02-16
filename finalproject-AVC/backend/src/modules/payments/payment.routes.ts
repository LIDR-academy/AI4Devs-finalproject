import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { paymentService } from './payment.service';
import { createPaymentRequestSchema, CreatePaymentRequest } from './payment.schemas';
import { authenticate } from '../../shared/middleware/auth.middleware';

export async function paymentRoutes(fastify: FastifyInstance) {
    /**
     * POST /api/v1/payments
     * Initiate payment for a reservation (authenticated users)
     */
    fastify.post<{
        Body: CreatePaymentRequest;
    }>(
        '/payments',
        {
            preHandler: [authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['reservationId'],
                    properties: {
                        reservationId: { type: 'string', format: 'uuid' },
                    },
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            reservationId: { type: 'string' },
                            userId: { type: 'string' },
                            amount: { type: 'number' },
                            status: { type: 'string' },
                            paymentUrl: { type: 'string' },
                            createdAt: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: CreatePaymentRequest }>, reply: FastifyReply) => {
            // Validate request body with Zod
            const { reservationId } = createPaymentRequestSchema.parse(request.body);

            // Get user ID from JWT token
            const user = request.user as { id: string; email: string; role: string };

            // Initiate payment
            const payment = await paymentService.initiatePayment(user.id, reservationId);

            return reply.status(201).send(payment);
        }
    );

    /**
     * POST /api/v1/payments/:paymentId/confirm
     * Confirm payment and update reservation status (authenticated users)
     */
    fastify.post<{
        Params: { paymentId: string };
    }>(
        '/payments/:paymentId/confirm',
        {
            preHandler: [authenticate],
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        paymentId: { type: 'string', format: 'uuid' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            payment: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    reservationId: { type: 'string' },
                                    userId: { type: 'string' },
                                    amount: { type: 'number' },
                                    status: { type: 'string' },
                                    paymentUrl: { type: 'string' },
                                    createdAt: { type: 'string' },
                                },
                            },
                            reservation: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    status: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{
                Params: { paymentId: string };
            }>,
            reply: FastifyReply
        ) => {
            const { paymentId } = request.params;

            // Get user ID from JWT token
            const user = request.user as { id: string; email: string; role: string };

            // Confirm payment
            const result = await paymentService.confirmPayment(paymentId, user.id);

            return reply.status(200).send(result);
        }
    );
}
