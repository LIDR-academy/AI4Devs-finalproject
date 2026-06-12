export function CatalogEmptyState() {
  return (
    <div
      data-testid="catalog-empty-state"
      className="text-center py-16"
    >
      <p className="text-gray-500 text-lg mb-2">No hay productos disponibles en este momento.</p>
      <p className="text-gray-400 text-sm">Vuelve a intentarlo más tarde.</p>
    </div>
  );
}
