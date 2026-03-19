'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AddressSortByColumn, SortDir } from '@/types/api';
import { AddressesSearchInput } from './addresses-search-input';
import { AddressesFavoriteFilter } from './addresses-favorite-filter';
import { AddressesActiveFilterChips } from './addresses-active-filter-chips';

type FavoriteValue = 'true' | 'false' | undefined;

interface AddressesFilterBarProps {
  initialQ: string;
  initialFavorite: FavoriteValue;
  sortBy: AddressSortByColumn;
  sortDir: SortDir;
}

interface FilterOverrides {
  q?: string;
  favorite?: FavoriteValue;
}

export function AddressesFilterBar({
  initialQ,
  initialFavorite,
  sortBy,
  sortDir,
}: AddressesFilterBarProps) {
  const router = useRouter();

  const [q, setQ] = useState(initialQ);
  const [favorite, setFavorite] = useState<FavoriteValue>(initialFavorite);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function buildUrl(overrides: FilterOverrides): string {
    const params = new URLSearchParams();
    params.set('sort', sortBy);
    params.set('dir', sortDir);

    const resolvedQ = 'q' in overrides ? overrides.q : q;
    const resolvedFavorite = 'favorite' in overrides ? overrides.favorite : favorite;

    if (resolvedQ) params.set('q', resolvedQ);
    if (resolvedFavorite) params.set('favorite', resolvedFavorite);

    return `/addresses?${params.toString()}`;
  }

  function handleSearchChange(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl({ q: value }));
    }, 300);
  }

  function handleFavoriteChange(value: FavoriteValue) {
    setFavorite(value);
    router.push(buildUrl({ favorite: value }));
  }

  function handleClearAll() {
    setQ('');
    setFavorite(undefined);
    router.push(`/addresses?sort=${sortBy}&dir=${sortDir}`);
  }

  const hasActiveFilters = Boolean(q) || Boolean(favorite);

  return (
    <div className="space-y-2 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <AddressesSearchInput value={q} onChange={handleSearchChange} />
        <AddressesFavoriteFilter value={favorite} onChange={handleFavoriteChange} />
      </div>
      {hasActiveFilters && (
        <AddressesActiveFilterChips
          q={q}
          favorite={favorite}
          onRemoveQ={() => handleSearchChange('')}
          onRemoveFavorite={() => handleFavoriteChange(undefined)}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
