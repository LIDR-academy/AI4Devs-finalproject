import { User } from '../../domain/user/User';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findBySessionId(sessionId: string): Promise<User | null>;
    save(user: User): Promise<User>;
}