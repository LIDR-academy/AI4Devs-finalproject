'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserSortByColumn, SortDir } from '@/types/api';
import { UsersSearchInput } from './users-search-input';
import { UsersRegisteredFilter } from './users-registered-filter';
import { UsersActiveFilterChips } from './users-active-filter-chips';

type RegisteredValue = 'true' | 'false' | undefined;

interface UsersFilterBarProps {
  initialQ: string;
  initialRegistered: RegisteredValue;
  sortBy: UserSortByColumn;
  sortDir: SortDir;
}

interface FilterOverrides {
  q?: string;
  registered?: RegisteredValue;
}

export function UsersFilterBar({
  initialQ,
  initialRegistered,
  sortBy,
  sortDir,
}: UsersFilterBarProps) {
  const router = useRouter();

  const [q, setQ] = useState(initialQ);
  const [registered, setRegistered] = useState<RegisteredValue>(initialRegistered);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function buildUrl(overrides: FilterOverrides): string {
    const params = new URLSearchParams();
    params.set('sort', sortBy);
    params.set('dir', sortDir);

    const resolvedQ = 'q' in overrides ? overrides.q : q;
    const resolvedRegistered = 'registered' in overrides ? overrides.registered : registered;

    if (resolvedQ) params.set('q', resolvedQ);
    if (resolvedRegistered) params.set('registered', resolvedRegistered);

    return `/users?${params.toString()}`;
  }

  function handleSearchChange(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl({ q: value }));
    }, 300);
  }

  function handleRegisteredChange(value: RegisteredValue) {
    setRegistered(value);
    router.push(buildUrl({ registered: value }));
  }

  function handleClearAll() {
    setQ('');
    setRegistered(undefined);
    router.push(`/users?sort=${sortBy}&dir=${sortDir}`);
  }

  const hasActiveFilters = Boolean(q) || Boolean(registered);

  return (
    <div className="space-y-2 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <UsersSearchInput value={q} onChange={handleSearchChange} />
        <UsersRegisteredFilter value={registered} onChange={handleRegisteredChange} />
      </div>
      {hasActiveFilters && (
        <UsersActiveFilterChips
          q={q}
          registered={registered}
          onRemoveQ={() => handleSearchChange('')}
          onRemoveRegistered={() => handleRegisteredChange(undefined)}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
