'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/cart-context';

export function CartBadge() {
  const { itemCount } = useCart();
  return (
    <Link href="/cart" className="relative p-2" aria-label="Ver carrito">
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span
          data-testid="cart-badge"
          className="absolute top-0 right-0 bg-rm-cta text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}
