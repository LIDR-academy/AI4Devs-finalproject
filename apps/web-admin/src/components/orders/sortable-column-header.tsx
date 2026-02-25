'use client';

import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import type { SortByColumn, SortDir } from '@/types/api';

interface SortableColumnHeaderProps {
  column: SortByColumn;
  label: string;
  currentSort: SortByColumn;
  currentDir: SortDir;
}

export function SortableColumnHeader({
  column,
  label,
  currentSort,
  currentDir,
}: SortableColumnHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = column === currentSort;
  const nextDir: SortDir = isActive && currentDir === 'asc' ? 'desc' : 'asc';

  const handleClick = () => {
    router.push(`${pathname}?sort=${column}&dir=${nextDir}`);
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
