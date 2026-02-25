'use client';

import { X } from 'lucide-react';
import {
  ORDER_STATUS_LABELS,
  ORDER_MODE_LABELS,
  type OrderStatus,
  type OrderMode,
} from '@/types/api';

function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface OrdersActiveFilterChipsProps {
  q: string;
  statuses: OrderStatus[];
  modes: OrderMode[];
  from: string | undefined;
  to: string | undefined;
  onRemoveQ: () => void;
  onRemoveStatus: (status: OrderStatus) => void;
  onRemoveMode: (mode: OrderMode) => void;
  onRemoveDate: () => void;
  onClearAll: () => void;
}

export function OrdersActiveFilterChips({
  q,
  statuses,
  modes,
  from,
  to,
  onRemoveQ,
  onRemoveStatus,
  onRemoveMode,
  onRemoveDate,
  onClearAll,
}: OrdersActiveFilterChipsProps) {
  const chips: Chip[] = [];

  if (q) {
    chips.push({ key: 'q', label: `"${q}"`, onRemove: onRemoveQ });
  }

  statuses.forEach((s) => {
    chips.push({
      key: `status-${s}`,
      label: ORDER_STATUS_LABELS[s],
      onRemove: () => onRemoveStatus(s),
    });
  });

  modes.forEach((m) => {
    chips.push({
      key: `mode-${m}`,
      label: ORDER_MODE_LABELS[m],
      onRemove: () => onRemoveMode(m),
    });
  });

  if (from || to) {
    const rangeLabel = [from && formatDateShort(from), to && formatDateShort(to)]
      .filter(Boolean)
      .join(' – ');
    chips.push({ key: 'date', label: rangeLabel, onRemove: onRemoveDate });
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
