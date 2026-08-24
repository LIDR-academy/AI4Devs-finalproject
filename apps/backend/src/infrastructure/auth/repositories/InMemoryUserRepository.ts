import { User } from '../../../domain/auth/entities/User.js';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  public async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? user : null;
  }

  public async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  public async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  // Metodo helper para tests
  public seedUser(user: User): void {
    this.users.set(user.id, user);
  }
}
