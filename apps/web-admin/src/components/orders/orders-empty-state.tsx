import { ShoppingCart } from 'lucide-react';

export function OrdersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-foreground mb-1">Sin pedidos todavía</h3>
      <p className="text-sm text-muted-foreground">
        Cuando se procese un pedido aparecerá aquí.
      </p>
    </div>
  );
}
