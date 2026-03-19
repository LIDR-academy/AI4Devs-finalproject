import { MapPin } from 'lucide-react';

interface AddressesEmptyStateProps {
  hasFilters?: boolean;
}

export function AddressesEmptyState({ hasFilters }: AddressesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <MapPin className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      {hasFilters ? (
        <>
          <h3 className="text-lg font-medium text-foreground mb-1">Sin resultados</h3>
          <p className="text-sm text-muted-foreground">
            Prueba a ajustar o limpiar los filtros activos.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-foreground mb-1">Sin direcciones todavía</h3>
          <p className="text-sm text-muted-foreground">
            Las direcciones aparecerán aquí cuando los usuarios las registren.
          </p>
        </>
      )}
    </div>
  );
}
