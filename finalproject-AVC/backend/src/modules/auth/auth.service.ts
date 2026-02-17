import { prisma } from '../../shared/utils/prisma';
import bcrypt from 'bcrypt';
import { UnauthorizedError } from '../../shared/errors/app-error';

export class AuthService {
    /**
     * Authenticate user with email and password
     * @param email - User email
     * @param password - User password (plain text)
     * @returns User object without password hash
     * @throws UnauthorizedError if credentials are invalid or user is inactive
     */
    async login(email: string, password: string) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Check if user exists
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Check if user is active
        if (!user.active) {
            throw new UnauthorizedError('User account is inactive');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Return user without password hash
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export const authService = new AuthService();
