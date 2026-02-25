'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

interface OrdersDateFilterProps {
  from: string | undefined;
  to: string | undefined;
  onApply: (from: string | undefined, to: string | undefined) => void;
}

export function OrdersDateFilter({ from, to, onApply }: OrdersDateFilterProps) {
  const [localFrom, setLocalFrom] = useState(from ?? '');
  const [localTo, setLocalTo] = useState(to ?? '');
  const [open, setOpen] = useState(false);

  const isActive = Boolean(from || to);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setLocalFrom(from ?? '');
      setLocalTo(to ?? '');
    }
    setOpen(nextOpen);
  };

  const handleApply = () => {
    onApply(localFrom || undefined, localTo || undefined);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalFrom('');
    setLocalTo('');
    onApply(undefined, undefined);
    setOpen(false);
  };

  const triggerLabel = isActive
    ? `📅 ${from ? formatDateShort(from) : '…'} – ${to ? formatDateShort(to) : '…'}`
    : undefined;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
          {isActive ? (
            <span>{triggerLabel}</span>
          ) : (
            <>
              <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Fecha
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <div className="space-y-3">
          <div>
            <label htmlFor="date-from" className="block text-xs font-medium text-muted-foreground mb-1">
              Desde
            </label>
            <input
              id="date-from"
              type="date"
              value={localFrom}
              max={localTo || undefined}
              onChange={(e) => setLocalFrom(e.target.value)}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="date-to" className="block text-xs font-medium text-muted-foreground mb-1">
              Hasta
            </label>
            <input
              id="date-to"
              type="date"
              value={localTo}
              min={localFrom || undefined}
              onChange={(e) => setLocalTo(e.target.value)}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-between pt-1">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="h-8 rounded-md bg-brand-teal px-3 text-sm font-medium text-white hover:bg-brand-teal/90 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
