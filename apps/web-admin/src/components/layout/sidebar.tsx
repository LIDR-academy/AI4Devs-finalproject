'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Users, MapPin, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/users', label: 'Usuarios', icon: Users },
  { href: '/addresses', label: 'Direcciones', icon: MapPin },
  { href: '/simulate', label: 'Simulación', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-brand-black shrink-0">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="text-xl font-bold tracking-tight text-brand-lime">
          adresles
        </span>
        <span className="text-xs text-white/30">admin</span>
      </div>

      <nav
        className="flex-1 space-y-1 px-3"
        aria-label="Navegación principal"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal',
                isActive
                  ? 'border-l-2 border-brand-lime bg-white/5 text-brand-lime'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4">
        <p className="text-xs text-white/30">v0.1.0</p>
      </div>
    </aside>
  );
}
