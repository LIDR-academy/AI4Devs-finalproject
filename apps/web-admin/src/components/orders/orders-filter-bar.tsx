'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus, OrderMode, SortByColumn, SortDir } from '@/types/api';
import { OrdersSearchInput } from './orders-search-input';
import { OrdersStatusFilter } from './orders-status-filter';
import { OrdersModeFilter } from './orders-mode-filter';
import { OrdersDateFilter } from './orders-date-filter';
import { OrdersActiveFilterChips } from './orders-active-filter-chips';

interface OrdersFilterBarProps {
  initialQ: string;
  initialStatus: OrderStatus[];
  initialMode: OrderMode[];
  initialFrom: string | undefined;
  initialTo: string | undefined;
  sortBy: SortByColumn;
  sortDir: SortDir;
}

interface FilterOverrides {
  q?: string;
  status?: OrderStatus[];
  mode?: OrderMode[];
  from?: string | undefined;
  to?: string | undefined;
}

export function OrdersFilterBar({
  initialQ,
  initialStatus,
  initialMode,
  initialFrom,
  initialTo,
  sortBy,
  sortDir,
}: OrdersFilterBarProps) {
  const router = useRouter();

  const [q, setQ] = useState(initialQ);
  const [statuses, setStatuses] = useState<OrderStatus[]>(initialStatus);
  const [modes, setModes] = useState<OrderMode[]>(initialMode);
  const [from, setFrom] = useState<string | undefined>(initialFrom);
  const [to, setTo] = useState<string | undefined>(initialTo);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function buildUrl(overrides: FilterOverrides): string {
    const params = new URLSearchParams();
    params.set('sort', sortBy);
    params.set('dir', sortDir);

    const resolvedQ = 'q' in overrides ? overrides.q : q;
    const resolvedStatuses = 'status' in overrides ? overrides.status! : statuses;
    const resolvedModes = 'mode' in overrides ? overrides.mode! : modes;
    const resolvedFrom = 'from' in overrides ? overrides.from : from;
    const resolvedTo = 'to' in overrides ? overrides.to : to;

    if (resolvedQ) params.set('q', resolvedQ);
    if (resolvedStatuses.length) params.set('status', resolvedStatuses.join(','));
    if (resolvedModes.length) params.set('mode', resolvedModes.join(','));
    if (resolvedFrom) params.set('from', resolvedFrom);
    if (resolvedTo) params.set('to', resolvedTo);

    return `/orders?${params.toString()}`;
  }

  function handleSearchChange(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl({ q: value }));
    }, 300);
  }

  function handleStatusToggle(status: OrderStatus) {
    const next = statuses.includes(status)
      ? statuses.filter((s) => s !== status)
      : [...statuses, status];
    setStatuses(next);
    router.push(buildUrl({ status: next }));
  }

  function handleModeToggle(mode: OrderMode) {
    const next = modes.includes(mode)
      ? modes.filter((m) => m !== mode)
      : [...modes, mode];
    setModes(next);
    router.push(buildUrl({ mode: next }));
  }

  function handleDateApply(newFrom: string | undefined, newTo: string | undefined) {
    setFrom(newFrom);
    setTo(newTo);
    router.push(buildUrl({ from: newFrom, to: newTo }));
  }

  function handleClearAll() {
    setQ('');
    setStatuses([]);
    setModes([]);
    setFrom(undefined);
    setTo(undefined);
    router.push(`/orders?sort=${sortBy}&dir=${sortDir}`);
  }

  const hasActiveFilters =
    Boolean(q) ||
    statuses.length > 0 ||
    modes.length > 0 ||
    Boolean(from) ||
    Boolean(to);

  return (
    <div className="space-y-2 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <OrdersSearchInput value={q} onChange={handleSearchChange} />
        <OrdersStatusFilter selected={statuses} onToggle={handleStatusToggle} />
        <OrdersModeFilter selected={modes} onToggle={handleModeToggle} />
        <OrdersDateFilter from={from} to={to} onApply={handleDateApply} />
      </div>
      {hasActiveFilters && (
        <OrdersActiveFilterChips
          q={q}
          statuses={statuses}
          modes={modes}
          from={from}
          to={to}
          onRemoveQ={() => handleSearchChange('')}
          onRemoveStatus={(s) => handleStatusToggle(s)}
          onRemoveMode={(m) => handleModeToggle(m)}
          onRemoveDate={() => handleDateApply(undefined, undefined)}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
