import { Suspense } from 'react';
import { fetchProducts } from '../lib/api-client';
import { ProductFilters } from '../types';
import { ProductGrid } from '../components/catalog/product-grid';
import { ResultsCounter } from '../components/catalog/results-counter';
import { CatalogEmptyState } from '../components/catalog/empty-state';
import { CatalogErrorState } from '../components/catalog/error-state';
import { FilterPanel } from '../components/catalog/filter-panel';
import { FilterEmptyState } from '../components/catalog/filter-empty-state';
import {
  VALID_DISTANCES,
  VALID_SURFACES,
  VALID_LEVELS,
  VALID_OBJECTIVES,
  VALID_CATEGORIES,
} from '../lib/product-utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'RunMarket — Productos para Running',
  description: 'Descubre zapatillas, ropa técnica y accesorios para running filtrados por tu perfil de corredor.',
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function normalizeParam<T extends string>(
  param: string | string[] | undefined,
  valid: readonly T[],
): T[] {
  const arr = Array.isArray(param) ? param : param ? [param] : [];
  return arr.filter((v): v is T => valid.includes(v as T));
}

function buildFilters(params: RawSearchParams): ProductFilters {
  const categoryRaw = Array.isArray(params.category) ? params.category[0] : params.category;
  const category = categoryRaw && (VALID_CATEGORIES as readonly string[]).includes(categoryRaw)
    ? categoryRaw
    : undefined;

  const priceMaxRaw = Array.isArray(params.priceMax) ? params.priceMax[0] : params.priceMax;
  const priceMaxNum = priceMaxRaw ? Number(priceMaxRaw) : NaN;
  const priceMax = Number.isFinite(priceMaxNum) && priceMaxNum > 0 ? priceMaxNum : undefined;

  return {
    distance: normalizeParam(params.distance, VALID_DISTANCES),
    surface: normalizeParam(params.surface, VALID_SURFACES),
    level: normalizeParam(params.level, VALID_LEVELS),
    objective: normalizeParam(params.objective, VALID_OBJECTIVES),
    category,
    priceMax,
  };
}

interface CatalogPageProps {
  searchParams: Promise<RawSearchParams>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const filters = buildFilters(params);

  const hasActiveFilters = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined,
  );

  let data: Awaited<ReturnType<typeof fetchProducts>>;

  try {
    data = await fetchProducts(filters);
  } catch {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Productos para Running</h1>
        <CatalogErrorState />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Productos para Running</h1>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        <Suspense fallback={<div className="w-full lg:w-64 shrink-0" />}>
          <FilterPanel activeFilters={filters} />
        </Suspense>
        <div className="flex-1 min-w-0">
          <ResultsCounter total={data.total} />
          {data.products.length === 0 ? (
            hasActiveFilters ? <FilterEmptyState /> : <CatalogEmptyState />
          ) : (
            <ProductGrid products={data.products} />
          )}
        </div>
      </div>
    </main>
  );
}
