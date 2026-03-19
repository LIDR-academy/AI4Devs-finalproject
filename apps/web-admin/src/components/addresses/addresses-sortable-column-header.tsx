'use client';

import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AddressSortByColumn, SortDir } from '@/types/api';

interface AddressesSortableColumnHeaderProps {
  column: AddressSortByColumn;
  label: string;
  currentSort: AddressSortByColumn;
  currentDir: SortDir;
}

export function AddressesSortableColumnHeader({
  column,
  label,
  currentSort,
  currentDir,
}: AddressesSortableColumnHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = column === currentSort;
  const nextDir: SortDir = isActive && currentDir === 'asc' ? 'desc' : 'asc';

  const handleClick = () => {
    const params = new URLSearchParams();
    params.set('sort', column);
    params.set('dir', nextDir);
    ['q', 'favorite'].forEach((key) => {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const Icon = isActive
    ? currentDir === 'asc'
      ? ChevronUp
      : ChevronDown
    : ChevronsUpDown;

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
      aria-label={`Ordenar por ${label} ${nextDir === 'asc' ? 'ascendente' : 'descendente'}`}
    >
      {label}
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${
          isActive ? 'text-foreground' : 'text-muted-foreground/50'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
