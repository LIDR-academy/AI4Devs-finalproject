'use client';

import { useRouter } from 'next/navigation';

export function CatalogErrorState() {
  const router = useRouter();

  return (
    <div
      data-testid="catalog-error-state"
      className="text-center py-16"
    >
      <p className="text-gray-500 text-lg mb-4">
        No se pudieron cargar los productos. Comprueba tu conexión e inténtalo de nuevo.
      </p>
      <button
        onClick={() => router.refresh()}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Reintentar
      </button>
    </div>
  );
}
