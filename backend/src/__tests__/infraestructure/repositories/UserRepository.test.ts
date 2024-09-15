import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { User } from '../../../domain/user/User';

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let testUser: User;

    beforeEach(async () => {
        userRepository = new UserRepository();
        testUser = new User();
        testUser.sessionId = `test-session-id-${Date.now()}-${Math.random()}`;
        testUser.creationDate = new Date();
        testUser.lastLogin = new Date();
        await userRepository.save(testUser);
    });

    it('should find a user by ID', async () => {
        const foundUser = await userRepository.findById(testUser.id);
        expect(foundUser).not.toBeNull();
        expect(foundUser?.id).toBe(testUser.id);
    });

    it('should find a user by session ID', async () => {
        const foundUser = await userRepository.findBySessionId(testUser.sessionId);
        expect(foundUser).not.toBeNull();
        expect(foundUser?.sessionId).toBe(testUser.sessionId);
    });

    it('should save a user', async () => {
        const newUser = new User();
        newUser.sessionId = `test-session-id-${Date.now()}-${Math.random()}`;
        newUser.creationDate = new Date();
        newUser.lastLogin = new Date();

        const savedUser = await userRepository.save(newUser);
        expect(savedUser).toHaveProperty('id');
        expect(savedUser.sessionId).toBe(newUser.sessionId);
    });
});