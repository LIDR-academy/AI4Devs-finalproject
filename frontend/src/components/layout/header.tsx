'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package } from 'lucide-react';
import { CartBadge } from './cart-badge';

export function Header() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-rm-cta rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="text-xl font-bold text-gray-900">RunMarket</span>
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link
            href="/"
            className={`${isActive('/') ? 'text-rm-cta' : 'text-gray-600 hover:text-gray-900'} transition`}
          >
            Catálogo
          </Link>
          <Link
            href="/orders"
            className={`${isActive('/orders') ? 'text-rm-cta' : 'text-gray-600 hover:text-gray-900'} flex items-center space-x-1 transition`}
          >
            <Package className="w-4 h-4" />
            <span>Pedidos</span>
          </Link>
        </nav>

        <CartBadge />
      </div>
    </header>
  );
}
