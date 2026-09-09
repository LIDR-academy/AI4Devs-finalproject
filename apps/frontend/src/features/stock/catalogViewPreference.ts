/**
 * Alternador grid/lista del catálogo de bodega (TK-116-FE, US-031): persistido
 * por dispositivo, misma convención que `useFefoTheme.ts` (clave kebab-case
 * dedicada, try/catch alrededor de `localStorage`, cae al default ante
 * cualquier valor ausente o corrupto en vez de romper el render).
 */
export type CatalogView = 'table' | 'grid';

const CATALOG_VIEW_STORAGE_KEY = 'fefo-catalog-view';
const DEFAULT_VIEW: CatalogView = 'table';

export function getCatalogView(): CatalogView {
  try {
    const stored = localStorage.getItem(CATALOG_VIEW_STORAGE_KEY);
    if (stored === 'table' || stored === 'grid') return stored;
  } catch (err) {
    console.error('[InsumoCatalogPanel] No se pudo leer la preferencia de vista del catálogo:', err);
  }
  return DEFAULT_VIEW;
}

export function setCatalogView(view: CatalogView): void {
  try {
    localStorage.setItem(CATALOG_VIEW_STORAGE_KEY, view);
  } catch (err) {
    console.error('[InsumoCatalogPanel] No se pudo persistir la preferencia de vista del catálogo:', err);
  }
}
