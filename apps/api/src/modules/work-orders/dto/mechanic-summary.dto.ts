import { UserRole } from '@prisma/client';

export class MechanicSummaryDto {
  id!: string;
  fullName!: string;
  role!: UserRole;
}
