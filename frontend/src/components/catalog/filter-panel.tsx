'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { ProductFilters } from '../../types';
import {
  DISTANCE_LABELS,
  SURFACE_LABELS,
  LEVEL_CONFIG,
  OBJECTIVE_LABELS,
} from '../../lib/product-utils';

interface FilterPanelProps {
  activeFilters: ProductFilters;
}

interface FilterSectionProps {
  title: string;
  dimension: keyof ProductFilters;
  options: Record<string, string>;
  activeValues: string[];
  onToggle: (dimension: keyof ProductFilters, value: string, checked: boolean) => void;
}

function FilterSection({ title, dimension, options, activeValues, onToggle }: FilterSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {Object.entries(options).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id={`${dimension}-${value}`}
              checked={activeValues.includes(value)}
              onChange={(e) => onToggle(dimension, value, e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const LEVEL_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(LEVEL_CONFIG).map(([k, v]) => [k, v.label]),
);

export function FilterPanel({ activeFilters }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const distance  = searchParams.getAll('distance');
  const surface   = searchParams.getAll('surface');
  const level     = searchParams.getAll('level');
  const objective = searchParams.getAll('objective');

  const activeCount = distance.length + surface.length + level.length + objective.length;
  const [isOpen, setIsOpen] = useState(activeCount > 0);

  const handleToggle = (dimension: keyof ProductFilters, value: string, checked: boolean) => {
    const current = searchParams.getAll(dimension);
    const updated = checked ? [...current, value] : current.filter((v) => v !== value);

    // Rebuild the full query string, updating only the toggled dimension.
    const params = new URLSearchParams(searchParams.toString());
    params.delete(dimension);
    updated.forEach((v) => params.append(dimension, v));

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/?${qs}` : '/', { scroll: false });
      // Force the Server Component to re-render with new searchParams,
      // bypassing the Next.js Router Cache for the current route.
      router.refresh();
    });
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-white rounded-lg shadow-sm p-4 lg:p-6 lg:sticky lg:top-20 self-start">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 lg:mb-6 lg:pointer-events-none"
        aria-expanded={isOpen}
        aria-controls="filter-sections"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="flex items-center gap-2">
          <Filter size={18} aria-hidden="true" />
          <span className="font-bold">Filtros</span>
          {activeCount > 0 && (
            <span
              data-testid="filter-badge"
              className="bg-blue-600 text-white text-xs rounded-full px-2 py-1"
            >
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`text-gray-500 transition-transform lg:hidden ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id="filter-sections"
        data-testid="filter-sections"
        className={`${isOpen ? 'block' : 'hidden'} lg:block mt-4 lg:mt-0`}
      >
        <FilterSection
          title="Distancia"
          dimension="distance"
          options={DISTANCE_LABELS}
          activeValues={distance}
          onToggle={handleToggle}
        />
        <FilterSection
          title="Superficie"
          dimension="surface"
          options={SURFACE_LABELS}
          activeValues={surface}
          onToggle={handleToggle}
        />
        <FilterSection
          title="Nivel"
          dimension="level"
          options={LEVEL_LABELS}
          activeValues={level}
          onToggle={handleToggle}
        />
        <FilterSection
          title="Objetivo"
          dimension="objective"
          options={OBJECTIVE_LABELS}
          activeValues={objective}
          onToggle={handleToggle}
        />
      </div>
    </aside>
  );
}
