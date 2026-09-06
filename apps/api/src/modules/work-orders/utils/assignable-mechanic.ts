import { Prisma, UserRole } from '@prisma/client';

export function isAssignableAsMechanic(user: {
  active: boolean;
  role: UserRole;
  canActAsMechanic: boolean;
}): boolean {
  if (!user.active) {
    return false;
  }

  if (user.role === UserRole.MECHANIC) {
    return true;
  }

  return user.role === UserRole.ADMIN && user.canActAsMechanic === true;
}

export function assignableMechanicWhere(): Prisma.UserWhereInput {
  return {
    active: true,
    OR: [
      { role: UserRole.MECHANIC },
      { role: UserRole.ADMIN, canActAsMechanic: true },
    ],
  };
}

export function normalizeCanActAsMechanic(
  role: UserRole,
  canActAsMechanic: boolean | undefined,
): boolean {
  if (role === UserRole.MECHANIC) {
    return false;
  }

  return canActAsMechanic === true;
}
