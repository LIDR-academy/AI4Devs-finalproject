'use client';

import { Search, X } from 'lucide-react';

interface OrdersSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function OrdersSearchInput({ value, onChange }: OrdersSearchInputProps) {
  return (
    <div className="relative flex items-center">
      <Search
        className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        aria-label="Buscar pedidos"
        placeholder="Buscar pedido, tienda, usuario…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-8 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      {value && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange('')}
          className="absolute right-2 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
