'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AppHeader } from '@/shared/components/AppHeader';
import { cn } from '@/shared/lib/cn';

const NAV_ITEMS = [{ href: '/mechanic/dashboard', label: 'Panel' }, { href: '/clients', label: 'Clientes' }];

export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProtectedRoute allowedRoles={['MECHANIC']}>
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="border-b border-slate-200 bg-white">
          <nav
            aria-label="Mecánico"
            className="mx-auto flex max-w-5xl gap-1 px-6"
          >
            {NAV_ITEMS.map((item) => {
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
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
