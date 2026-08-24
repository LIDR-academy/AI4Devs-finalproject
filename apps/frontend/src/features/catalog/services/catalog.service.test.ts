import { describe, it, expect, vi, afterEach } from 'vitest';
import { CatalogService } from './catalog.service.js';

describe('CatalogService — gestión de catálogo (TK-057-FE)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('lista los insumos reales del backend', async () => {
    const mockInsumos = [
      { id: 'ins-1', name: 'Harina 000', unitOfMeasure: 'KG', warehouseStock: '0.000' },
      { id: 'ins-2', name: 'Salsa Pomodoro', unitOfMeasure: 'L', warehouseStock: '0.000' },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => mockInsumos }));

    const result = await CatalogService.listInsumos();

    expect(result).toEqual(mockInsumos);
  });

  it('crea un insumo nuevo y retorna el registro real del backend', async () => {
    const mockInsumo = { id: 'ins-new-1', name: 'Harina 000', unitOfMeasure: 'KG', warehouseStock: '0.000' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => mockInsumo }));

    const result = await CatalogService.createInsumo({ name: 'Harina 000', unitOfMeasure: 'KG' });

    expect(result).toEqual(mockInsumo);
  });

  it('propaga el error real (400) cuando falta el nombre, sin fingir éxito', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ message: 'El nombre es requerido' }) })
    );

    await expect(CatalogService.createInsumo({ name: '', unitOfMeasure: 'KG' })).rejects.toMatchObject({ status: 400 });
  });

  it('lista las recetas reales del backend con sus ingredientes', async () => {
    const mockRecipes = [
      { id: 'rec-1', name: 'Pizza Margarita', category: 'Pizzas', ingredients: [{ insumoId: 'ins-1', quantity: '0.150' }] },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => mockRecipes }));

    const result = await CatalogService.listRecipes();

    expect(result).toEqual(mockRecipes);
  });

  it('crea una receta nueva y retorna el resultado real del backend', async () => {
    const mockResult = { message: 'Recipe created successfully', recipeId: 'rec-new-1' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => mockResult }));

    const result = await CatalogService.createRecipe({
      name: 'Pizza Margarita',
      category: 'Pizzas',
      ingredients: [{ insumoId: 'ins-1', quantity: '0.150' }],
    });

    expect(result).toEqual(mockResult);
  });

  it('propaga 404 cuando un ingrediente referencia un insumo inexistente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({ message: 'Insumo no encontrado' }) })
    );

    await expect(
      CatalogService.createRecipe({ name: 'X', category: 'Pizzas', ingredients: [{ insumoId: 'inexistente', quantity: '1' }] })
    ).rejects.toMatchObject({ status: 404 });
  });
});
