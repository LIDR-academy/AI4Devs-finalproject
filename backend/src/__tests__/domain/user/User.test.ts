import { User } from '../../../domain/models/User';
import { validate } from 'class-validator';

describe('User Entity', () => {
    it('should create a valid User entity', async () => {
        const user = new User();
        user.sessionId = `test-session-id-${Date.now()}-${Math.random()}`;
        user.creationDate = new Date();
        user.lastLogin = new Date();

        const errors = await validate(user);
        expect(errors.length).toBe(0);
    });

    it('should allow nullable lastLogin', async () => {
        const user = new User();
        user.sessionId = `test-session-id-${Date.now()}-${Math.random()}`;
        user.creationDate = new Date();
        const errors = await validate(user);
        expect(errors.length).toBe(0);
    });
});