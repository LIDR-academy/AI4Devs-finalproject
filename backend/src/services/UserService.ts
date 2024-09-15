import { UserRepository } from "../infrastructure/repositories/UserRepository";
import { User } from "../domain/user/User";
import { NotFoundError } from "../domain/shared/NotFoundError";

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError(`User with id ${id} not found`);
        }
        return user;
    }

    async getUserBySessionId(sessionId: string): Promise<User> {
        const user = await this.userRepository.findBySessionId(sessionId);
        if (!user) {
            throw new NotFoundError(`User with session ID ${sessionId} not found`);
        }
        return user;
    }

    async createUser(sessionId: string): Promise<User> {
        const user = new User();
        user.sessionId = sessionId;
        user.creationDate = new Date();
        return this.userRepository.save(user);
    }
}