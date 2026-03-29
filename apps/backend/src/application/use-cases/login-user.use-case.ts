import { IUserRepository } from '@/domain/repositories/user.repository';
import { LoginUserDto } from '@/domain/dtos/auth.dto';
import { InvalidCredentialsError } from '@/domain/errors/custom.errors';
import { SecurityService } from '@/infrastructure/security/security.service';

interface LoginResult {
  user: {
    id: string;
    email: string;
    fullName: string | null | undefined;
    role: string;
  };
  accessToken: string;
}

export class LoginUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: LoginUserDto): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await SecurityService.comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const accessToken = SecurityService.generateToken({
      userId: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
    };
  }
}
