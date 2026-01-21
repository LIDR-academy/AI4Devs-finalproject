import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './app-error';
import { ZodError } from 'zod';

export const errorHandler = (
    error: FastifyError | AppError | ZodError | Error,
    request: FastifyRequest,
    reply: FastifyReply
) => {
    // Handle AppError
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
        });
    }

    // Handle Fastify errors
    if ('statusCode' in error) {
        return reply.status(error.statusCode || 500).send({
            error: error.code || 'INTERNAL_ERROR',
            message: error.message,
        });
    }

    // Default error
    request.log.error(error);
    return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
    });
};
