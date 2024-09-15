import { UserService } from '../../services/UserService';
import { User } from '../../domain/user/User';
import { AppDataSource } from '../../data-source';
import { NotFoundError } from '../../domain/errors/NotFoundError';

beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
});

afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

describe('UserService', () => {
    let userService: UserService;
    let testUser: User;

    beforeEach(async () => {
        userService = new UserService();
        testUser = await userService.createUser(`test-session-id-${Date.now()}`);
    });

    it('should get a user by ID', async () => {
        const foundUser = await userService.getUserById(testUser.id);
        expect(foundUser).not.toBeNull();
        expect(foundUser.id).toBe(testUser.id);
    });

    it('should throw NotFoundError if user ID does not exist', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        await expect(userService.getUserById(nonExistentId)).rejects.toThrow(NotFoundError);
    });

    it('should get a user by session ID', async () => {
        const foundUser = await userService.getUserBySessionId(testUser.sessionId);
        expect(foundUser).not.toBeNull();
        expect(foundUser.sessionId).toBe(testUser.sessionId);
    });

    it('should throw NotFoundError if session ID does not exist', async () => {
        await expect(userService.getUserBySessionId('non-existent-session-id')).rejects.toThrow(NotFoundError);
    });

    it('should create a new user', async () => {
        const sessionId = `test-session-id-${Date.now()}`;
        const newUser = await userService.createUser(sessionId);
        expect(newUser).toHaveProperty('id');
        expect(newUser.sessionId).toBe(sessionId);
    });
});