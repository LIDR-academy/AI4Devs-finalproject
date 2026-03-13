import { Users } from 'lucide-react';

interface UsersEmptyStateProps {
  hasFilters?: boolean;
}

export function UsersEmptyState({ hasFilters }: UsersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Users className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      {hasFilters ? (
        <>
          <h3 className="text-lg font-medium text-foreground mb-1">Sin resultados</h3>
          <p className="text-sm text-muted-foreground">
            Prueba a ajustar o limpiar los filtros activos.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-foreground mb-1">Sin usuarios todavía</h3>
          <p className="text-sm text-muted-foreground">
            Los usuarios aparecerán aquí cuando interactúen con Adresles.
          </p>
        </>
      )}
    </div>
  );
}
