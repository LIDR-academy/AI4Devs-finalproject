import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ConflictError } from '../../shared/errors/app-error';

const prisma = new PrismaClient();

export class UserService {
    /**
     * Create a new user
     * @param email - User email
     * @param password - User password (plain text)
     * @param role - User role (PLAYER or ADMIN)
     * @returns User object without password hash
     * @throws ConflictError if email already exists
     */
    async createUser(email: string, password: string, role: Role) {
        // Check if user with email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role,
                active: true,
            },
        });

        // Return user without password hash
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export const userService = new UserService();
