import { ShoppingCart } from 'lucide-react';

interface OrdersEmptyStateProps {
  hasFilters?: boolean;
}

export function OrdersEmptyState({ hasFilters = false }: OrdersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      {hasFilters ? (
        <>
          <h3 className="text-lg font-medium text-foreground mb-1">Sin resultados</h3>
          <p className="text-sm text-muted-foreground">
            Prueba a ajustar o limpiar los filtros activos.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-foreground mb-1">Sin pedidos todavía</h3>
          <p className="text-sm text-muted-foreground">
            Cuando se procese un pedido aparecerá aquí.
          </p>
        </>
      )}
    </div>
  );
}
