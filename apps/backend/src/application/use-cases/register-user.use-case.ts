import { IUserRepository } from '@/domain/repositories/user.repository';
import { RegisterUserDto } from '@/domain/dtos/auth.dto';
import { User } from '@/domain/entities/user.entity';
import { UserAlreadyExistsError } from '@/domain/errors/custom.errors';
import { SecurityService } from '@/infrastructure/security/security.service';

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: RegisterUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const passwordHash = await SecurityService.hashPassword(dto.password);

    // Create entity instance (ID is technically unknown until DB create, 
    // or we generate it here if we want pure domain UUID).
    // For simplicity with Prisma default(uuid()), we pass a placeholder or let repository handle it.
    // However, the Entity expects ID.
    // Let's assume we pass empty string and Repo returns full entity.
    
    // Better: Helper static method/factory on Entity or just simple object passing 
    // but the Repository.save(User) expects a User object.
    
    // Let's cheat slightly and instantiate User with "temp-id" or change save signature
    // but strict Clean Arch prefers Entity to be valid.
    
    // We will create the user object with the data we have.
    const newUser = new User(
      '', // ID assigned by DB
      dto.email,
      passwordHash,
      'CLIENT',
      'FREE',
      dto.fullName
    );

    return this.userRepository.save(newUser);
  }
}
