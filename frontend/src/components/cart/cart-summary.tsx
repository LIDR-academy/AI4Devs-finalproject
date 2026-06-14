'use client';

import Link from 'next/link';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
}

function formatPrice(value: number): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CartSummary({
  subtotal,
  shipping,
  total,
  itemCount,
  onCheckout,
}: CartSummaryProps) {
  const freeShippingThreshold = 50;
  const remaining = freeShippingThreshold - subtotal;

  return (
    <div className="rounded-lg shadow-sm border border-border p-6 flex flex-col gap-4 bg-white">
      <h2 className="text-lg font-semibold">Resumen del pedido</h2>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)} €</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            {shipping === 0 ? (
              <span className="text-green-600 font-medium">Gratis</span>
            ) : (
              <span>{formatPrice(shipping)} €</span>
            )}
          </div>
          {shipping > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              ¡Añade {formatPrice(remaining)}€ más para envío gratis!
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-4 flex justify-between font-semibold text-base">
        <span>Total</span>
        <span>{formatPrice(total)} €</span>
      </div>

      <button
        onClick={onCheckout}
        disabled={itemCount === 0}
        className="w-full py-3 rounded-lg bg-rm-cta hover:bg-rm-cta-hover text-rm-cta-fg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Tramitar pedido
      </button>

      <Link
        href="/"
        className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Continuar comprando
      </Link>
    </div>
  );
}
