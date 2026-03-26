import { User } from '../../modules/users/entities/user.entity';
import { UserResponseDto } from '../../modules/users/dto/user-response.dto';

/**
 * Mapper utility for converting User entities to DTOs.
 * Centralizes the mapping logic to avoid code duplication.
 */
export class UserMapper {
  /**
   * Maps a User entity to UserResponseDto.
   * Excludes sensitive information such as passwordHash.
   *
   * @param user - User entity to map
   * @returns UserResponseDto with public fields only
   */
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
