import type { UserRole } from '@/features/auth/types/auth.types';
import { cn } from '@/shared/lib/cn';

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MECHANIC: 'Mecánico',
};

const ROLE_CLASSES: Record<UserRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  MECHANIC: 'bg-blue-100 text-blue-800',
};

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        ROLE_CLASSES[role],
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
