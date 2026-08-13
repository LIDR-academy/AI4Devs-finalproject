'use client';

import { Toaster } from 'sonner';
import { CartProvider } from '../contexts/cart-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster position="bottom-right" richColors />
    </CartProvider>
  );
}
