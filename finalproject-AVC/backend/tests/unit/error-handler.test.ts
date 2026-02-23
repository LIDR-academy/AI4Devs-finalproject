import { FastifyReply, FastifyRequest } from 'fastify';
import { errorHandler } from '../../src/shared/errors/error-handler';
import {
    AppError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
    ConflictError,
} from '../../src/shared/errors/app-error';
import { ZodError } from 'zod';

// Mock Fastify request and reply
const createMockRequest = (): Partial<FastifyRequest> => ({
    log: {
        error: jest.fn(),
    } as any,
});

const createMockReply = (): Partial<FastifyReply> => {
    const reply: any = {
        statusCode: 200,
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
    };
    return reply;
};

describe('Error Handler', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
        mockRequest = createMockRequest();
        mockReply = createMockReply();
    });

    describe('AppError handling', () => {
        it('should handle NotFoundError with 404 status', () => {
            const error = new NotFoundError('User');

            errorHandler(error as any, mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'RESOURCE_NOT_FOUND',
                message: 'User not found',
            });
        });

        it('should handle UnauthorizedError with 401 status', () => {
            const error = new UnauthorizedError('Invalid credentials');

            errorHandler(error as any, mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'UNAUTHORIZED',
                message: 'Invalid credentials',
            });
        });

        it('should handle ValidationError with 400 status', () => {
            const error = new ValidationError('Invalid email format');

            errorHandler(error as any, mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'VALIDATION_ERROR',
                message: 'Invalid email format',
            });
        });

        it('should handle ConflictError with 409 status', () => {
            const error = new ConflictError('Reservation time conflict');

            errorHandler(error as any, mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(409);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'CONFLICT',
                message: 'Reservation time conflict',
            });
        });

        it('should handle custom AppError', () => {
            const error = new AppError(418, 'IM_A_TEAPOT', 'I am a teapot');

            errorHandler(error as any, mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(418);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'IM_A_TEAPOT',
                message: 'I am a teapot',
            });
        });
    });

    describe('ZodError handling', () => {
        it('should handle Zod validation errors', () => {
            const zodError = new ZodError([
                {
                    code: 'invalid_type',
                    expected: 'string',
                    received: 'number',
                    path: ['email'],
                    message: 'Expected string, received number',
                },
            ]);

            errorHandler(zodError as any, mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: zodError.errors,
            });
        });
    });

    describe('Generic error handling', () => {
        it('should handle unknown errors with 500 status', () => {
            const error = new Error('Something went wrong');

            errorHandler(error as any, mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
            });
        });

        it('should log unknown errors', () => {
            const error = new Error('Something went wrong');

            errorHandler(error as any, mockRequest as any, mockReply as any);

            expect(mockRequest.log?.error).toHaveBeenCalledWith(error);
        });

        it('should handle errors with statusCode property', () => {
            const error: any = new Error('Bad request');
            error.statusCode = 400;
            error.code = 'BAD_REQUEST';

            errorHandler(error as any, mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
        });
    });
});
