import { FastifyRequest } from 'fastify';
import { Role } from '@prisma/client';
import { ForbiddenError } from '../errors/app-error';

/**
 * Authorization middleware factory
 * Checks if authenticated user has required role(s)
 * @param allowedRoles - Array of roles that are allowed to access the resource
 */
export function authorize(allowedRoles: Role[]) {
    return async (request: FastifyRequest) => {
        const user = request.user as { id: string; email: string; role: Role };

        if (!user || !allowedRoles.includes(user.role)) {
            throw new ForbiddenError('You do not have permission to access this resource');
        }
    };
}
