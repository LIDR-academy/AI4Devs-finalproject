import { User } from '../../../domain/user/User';
import { validate } from 'class-validator';
import { AppDataSource } from '../../../data-source';

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

describe('User Entity', () => {
    it('should create a valid User entity', async () => {
        const user = new User();
        user.sessionId = `test-session-id-${Date.now()}`;
        user.creationDate = new Date();
        user.lastLogin = new Date();

        const errors = await validate(user);
        expect(errors.length).toBe(0);
    });

    it('should allow nullable lastLogin', async () => {
        const user = new User();
        user.sessionId = `test-session-id-${Date.now()}`;
        user.creationDate = new Date();

        const errors = await validate(user);
        expect(errors.length).toBe(0);
    });
});