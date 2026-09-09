import { describe, it, expect, beforeEach } from 'vitest';
import { getCatalogView, setCatalogView } from './catalogViewPreference.js';

describe('TK-116-FE: catalogViewPreference (alternador grid/lista, device-local)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sin preferencia guardada, el valor por defecto es "table"', () => {
    expect(getCatalogView()).toBe('table');
  });

  it('persiste "grid" y lo devuelve en la siguiente lectura', () => {
    setCatalogView('grid');
    expect(getCatalogView()).toBe('grid');
  });

  it('un valor corrupto en localStorage cae al default en vez de romper', () => {
    localStorage.setItem('fefo-catalog-view', 'not-a-valid-view');
    expect(getCatalogView()).toBe('table');
  });
});
