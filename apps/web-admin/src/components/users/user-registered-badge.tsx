import { cn } from '@/lib/utils';

interface UserRegisteredBadgeProps {
  isRegistered: boolean;
  className?: string;
}

export function UserRegisteredBadge({
  isRegistered,
  className,
}: UserRegisteredBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        isRegistered
          ? 'bg-brand-teal/10 text-brand-teal'
          : 'bg-gray-100 text-gray-500',
        className,
      )}
    >
      {isRegistered ? 'Sí' : 'No'}
    </span>
  );
}
