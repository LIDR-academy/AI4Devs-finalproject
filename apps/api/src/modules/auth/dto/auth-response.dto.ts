import { UserRole } from '@prisma/client';

export class UserPayloadDto {
  id!: string;
  email!: string;
  fullName!: string;
  role!: UserRole;
}

export class MeResponseDto extends UserPayloadDto {
  active!: boolean;
}

export class AuthResponseDto {
  accessToken!: string;
  user!: UserPayloadDto;
  refreshToken?: string;
}

export class RefreshResponseDto {
  accessToken!: string;
  refreshToken?: string;
}
