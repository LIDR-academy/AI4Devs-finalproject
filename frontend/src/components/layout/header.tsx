import Link from 'next/link';
import { CartBadge } from './cart-badge';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-rm-cta rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="text-xl font-bold text-gray-900">RunMarket</span>
        </Link>
        <CartBadge />
      </div>
    </header>
  );
}
