'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/lib/cn';

const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Panel' },
  { href: '/admin/users', label: 'Usuarios' },
  { href: '/clients', label: 'Clientes' },
  { href: '/vehicles', label: 'Vehículos' },
];

const MECHANIC_NAV = [
  { href: '/mechanic/dashboard', label: 'Panel' },
  { href: '/clients', label: 'Clientes' },
  { href: '/vehicles', label: 'Vehículos' },
];

export function RoleNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const items = user.role === 'ADMIN' ? ADMIN_NAV : MECHANIC_NAV;
  const ariaLabel = user.role === 'ADMIN' ? 'Administración' : 'Mecánico';
  const maxWidth = user.role === 'ADMIN' ? 'max-w-6xl' : 'max-w-5xl';

  return (
    <div className="border-b border-slate-200 bg-white">
      <nav
        aria-label={ariaLabel}
        className={cn('mx-auto flex gap-1 px-6', maxWidth)}
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
