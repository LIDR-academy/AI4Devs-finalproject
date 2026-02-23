import { FastifyRequest } from 'fastify';
import { UnauthorizedError } from '../errors/app-error';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
export async function authenticate(request: FastifyRequest) {
    try {
        // Verify JWT token from Authorization header
        await request.jwtVerify();
    } catch (error) {
        throw new UnauthorizedError('Invalid or missing authentication token');
    }
}
