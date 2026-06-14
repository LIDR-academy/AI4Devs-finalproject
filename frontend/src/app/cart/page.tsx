'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../../contexts/cart-context';
import { CartItemRow } from '../../components/cart/cart-item-row';
import { CartSummary } from '../../components/cart/cart-summary';

export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, shipping, total, isLoading, updateItem, removeItem } =
    useCart();

  async function handleQuantityChange(
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ) {
    try {
      await updateItem(productId, quantity, size, color);
    } catch {
      toast.error('No se pudo actualizar el carrito. Inténtalo de nuevo.');
    }
  }

  async function handleRemove(productId: string, size?: string, color?: string) {
    try {
      await removeItem(productId, size, color);
    } catch {
      toast.error('No se pudo eliminar el artículo. Inténtalo de nuevo.');
    }
  }

  function handleCheckout() {
    router.push('/checkout');
  }

  if (itemCount === 0 && !isLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <ShoppingCart size={64} className="text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground">
          Explora nuestro catálogo y añade productos que te interesen.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-rm-cta hover:bg-rm-cta-hover text-rm-cta-fg font-medium transition-colors"
        >
          Ver catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Mi carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-8 items-start">
        <section className="bg-white rounded-lg shadow-sm p-6">
          {items.map((item) => (
            <CartItemRow
              key={`${item.productId}-${item.size ?? ''}-${item.color ?? ''}`}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
              isUpdating={isLoading}
            />
          ))}
        </section>

        <aside>
          <CartSummary
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            itemCount={itemCount}
            onCheckout={handleCheckout}
          />
        </aside>
      </div>
    </main>
  );
}
