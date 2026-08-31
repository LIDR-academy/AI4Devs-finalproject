import { User } from '../../../domain/auth/entities/User.js';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  public async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? user : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email && user.email.trim().toLowerCase() === normalized) {
        return user;
      }
    }
    return null;
  }

  public async findByResetTokenHash(tokenHash: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.resetTokenHash && user.resetTokenHash === tokenHash) {
        return user;
      }
    }
    return null;
  }


  public async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  public async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  public async update(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  public async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  // Metodo helper para tests
  public seedUser(user: User): void {
    this.users.set(user.id, user);
  }
}
