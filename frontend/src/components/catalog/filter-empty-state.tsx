'use client';

import { useRouter } from 'next/navigation';

export function FilterEmptyState() {
  const router = useRouter();

  return (
    <div data-testid="filter-empty-state" className="text-center py-12">
      <p className="text-gray-500 mb-4">No se encontraron productos para esta combinación.</p>
      <button
        onClick={() => router.replace('/')}
        className="text-blue-600 hover:text-blue-700"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
