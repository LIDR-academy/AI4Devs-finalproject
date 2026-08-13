'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/lib/cn';
import {
  getNavAriaLabel,
  getNavItemsForRole,
  getShellMaxWidthClassName,
} from './nav-items';

type RoleNavProps = {
  maxWidthClassName?: string;
};

export function RoleNav({ maxWidthClassName }: RoleNavProps = {}) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const items = getNavItemsForRole(user.role);
  const ariaLabel = getNavAriaLabel(user.role);
  const maxWidth = maxWidthClassName ?? getShellMaxWidthClassName(user.role);

  return (
    <div className="hidden border-b border-slate-200 bg-white md:block">
      <nav
        aria-label={ariaLabel}
        className={cn('mx-auto flex gap-1 px-4 md:px-6', maxWidth)}
      >
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'border-b-2 px-3 py-3 text-sm font-medium transition',
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
