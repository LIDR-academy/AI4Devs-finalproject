import { cn } from '@/shared/lib/cn';

interface UserStatusBadgeProps {
  active: boolean;
}

export function UserStatusBadge({ active }: UserStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        active ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700',
      )}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );
}
