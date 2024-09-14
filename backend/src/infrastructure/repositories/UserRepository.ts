import { Repository } from "typeorm";
import { User } from "../../domain/user/User";
import { AppDataSource } from "../../data-source";

export class UserRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findBySessionId(sessionId: string): Promise<User | null> {
        return this.repository.findOne({ where: { sessionId } });
    }

    async save(user: User): Promise<User> {
        return this.repository.save(user);
    }
}