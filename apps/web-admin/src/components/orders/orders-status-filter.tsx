'use client';

import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  VALID_ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '@/types/api';
import { cn } from '@/lib/utils';

const STATUS_DOT_COLORS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-gray-400',
  PENDING_ADDRESS: 'bg-brand-lime',
  READY_TO_PROCESS: 'bg-brand-teal',
  COMPLETED: 'bg-emerald-500',
  CANCELED: 'bg-red-500',
};

interface OrdersStatusFilterProps {
  selected: OrderStatus[];
  onToggle: (status: OrderStatus) => void;
}

export function OrdersStatusFilter({ selected, onToggle }: OrdersStatusFilterProps) {
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
          Estado
          {isActive && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-brand-teal text-white text-xs font-bold px-1">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2">
        <ul role="list" className="space-y-0.5">
          {VALID_ORDER_STATUSES.map((status) => {
            const checked = selected.includes(status);
            return (
              <li key={status}>
                <label className="flex items-center gap-2.5 rounded px-2 py-1.5 cursor-pointer hover:bg-accent text-sm select-none">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(status)}
                    className="h-4 w-4 rounded border-gray-300 accent-brand-teal"
                  />
                  <span
                    className={cn('h-2 w-2 rounded-full flex-shrink-0', STATUS_DOT_COLORS[status])}
                    aria-hidden="true"
                  />
                  {ORDER_STATUS_LABELS[status]}
                </label>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
