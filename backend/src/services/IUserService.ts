import { User } from '../domain/user/User';

export interface IUserService {
    getUserById(id: string): Promise<User | null>;
    getUserBySessionId(sessionId: string): Promise<User | null>;
    createUser(sessionId: string): Promise<User>;
}