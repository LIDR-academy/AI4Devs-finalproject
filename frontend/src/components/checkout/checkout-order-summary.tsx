'use client';

import { useCart } from '../../contexts/cart-context';

export function CheckoutOrderSummary() {
  const { items, subtotal, shipping, total } = useCart();

  const fmt = (n: number) =>
    n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="sticky top-20 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Resumen del pedido</h2>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={`${item.productId}-${item.size ?? ''}-${item.color ?? ''}`} className="flex gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-tight">{item.productName}</p>
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

      <div className="mt-4 space-y-2 border-t border-border pt-4">
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
    </div>
  );
}
