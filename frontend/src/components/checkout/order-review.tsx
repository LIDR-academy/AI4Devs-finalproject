'use client';

import type { CartItemUI } from '../../types/cart';
import type { ShippingData } from '../../types/checkout';

interface OrderReviewProps {
  shippingData: ShippingData;
  items: CartItemUI[];
  subtotal: number;
  shipping: number;
  total: number;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onBack: () => void;
}

export function OrderReview({
  shippingData,
  items,
  subtotal,
  shipping,
  total,
  isSubmitting,
  error,
  onConfirm,
  onBack,
}: OrderReviewProps) {
  const fmt = (n: number) =>
    n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Dirección de envío</h3>
        <div className="rounded-lg border border-border p-4 text-sm text-foreground">
          <p>{shippingData.name}</p>
          <p>{shippingData.address}</p>
          <p>
            <span>{shippingData.city}</span>, <span>{shippingData.postalCode}</span>
          </p>
          <p>{shippingData.country}</p>
          <p className="mt-2 text-muted-foreground">{shippingData.email}</p>
          {shippingData.phone && (
            <p className="text-muted-foreground">{shippingData.phone}</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Artículos</h3>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size ?? ''}-${item.color ?? ''}`}
              className="flex gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {item.productName}
                </p>
                <p className="text-xs text-muted-foreground">{item.productBrand}</p>
                {(item.size || item.color) && (
                  <p className="text-xs text-muted-foreground">
                    {item.size && <span>Talla: {item.size}</span>}
                    {item.size && item.color && <span> · </span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </p>
                )}
              </div>
              <p className="text-sm font-medium text-foreground flex-shrink-0">
                {item.quantity} × {fmt(item.productPrice)} €
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{fmt(subtotal)} €</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          {shipping === 0 ? (
            <span className="text-green-600 font-medium">Gratis</span>
          ) : (
            <span>{fmt(shipping)} €</span>
          )}
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
          <span>Total</span>
          <span>{fmt(total)} €</span>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-border bg-white px-4 py-3 font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full rounded-lg bg-rm-cta px-4 py-3 font-medium text-rm-cta-fg transition-colors hover:bg-rm-cta-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Procesando…' : 'Confirmar pedido'}
        </button>
      </div>
    </div>
  );
}
