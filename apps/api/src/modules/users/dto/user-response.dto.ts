import { UserRole } from '@prisma/client';

export class UserResponseDto {
  id!: string;
  fullName!: string;
  email!: string;
  role!: UserRole;
  active!: boolean;
  createdAt!: Date;
  updatedAt?: Date;
}
