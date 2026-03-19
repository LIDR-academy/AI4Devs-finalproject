'use client';

import { X } from 'lucide-react';
import { ADDRESS_FAVORITE_FILTER_LABELS } from '@/types/api';

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface AddressesActiveFilterChipsProps {
  q: string;
  favorite: 'true' | 'false' | undefined;
  onRemoveQ: () => void;
  onRemoveFavorite: () => void;
  onClearAll: () => void;
}

export function AddressesActiveFilterChips({
  q,
  favorite,
  onRemoveQ,
  onRemoveFavorite,
  onClearAll,
}: AddressesActiveFilterChipsProps) {
  const chips: Chip[] = [];

  if (q) {
    chips.push({ key: 'q', label: `"${q}"`, onRemove: onRemoveQ });
  }

  if (favorite) {
    chips.push({
      key: 'favorite',
      label: ADDRESS_FAVORITE_FILTER_LABELS[favorite],
      onRemove: onRemoveFavorite,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Filtros activos">
      {chips.map((chip) => (
        <span
          key={chip.key}
          role="listitem"
          className="inline-flex items-center gap-1 rounded-full border border-brand-teal bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal"
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Eliminar filtro ${chip.label}`}
            onClick={chip.onRemove}
            className="ml-0.5 rounded-full hover:bg-brand-teal/20 p-0.5 transition-colors"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
      >
        Limpiar todo
      </button>
    </div>
  );
}
