'use client';

import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  VALID_ORDER_MODES,
  ORDER_MODE_LABELS,
  type OrderMode,
} from '@/types/api';
import { cn } from '@/lib/utils';

interface OrdersModeFilterProps {
  selected: OrderMode[];
  onToggle: (mode: OrderMode) => void;
}

export function OrdersModeFilter({ selected, onToggle }: OrdersModeFilterProps) {
  const isActive = selected.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 h-9 rounded-md border px-3 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            isActive
              ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
              : 'border-input bg-background text-foreground hover:bg-accent',
          )}
        >
          Modo
          {isActive && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-brand-teal text-white text-xs font-bold px-1">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-2">
        <ul role="list" className="space-y-0.5">
          {VALID_ORDER_MODES.map((mode) => {
            const checked = selected.includes(mode);
            return (
              <li key={mode}>
                <label className="flex items-center gap-2.5 rounded px-2 py-1.5 cursor-pointer hover:bg-accent text-sm select-none">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(mode)}
                    className="h-4 w-4 rounded border-gray-300 accent-brand-teal"
                  />
                  {ORDER_MODE_LABELS[mode]}
                </label>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
