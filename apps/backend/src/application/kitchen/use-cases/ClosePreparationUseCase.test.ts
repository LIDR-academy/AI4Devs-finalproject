import { describe, it, expect, beforeEach } from 'vitest';
import { ClosePreparationUseCase } from './ClosePreparationUseCase.js';
import { AbandonPreparationUseCase } from './AbandonPreparationUseCase.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryLocationRepository } from '../../../infrastructure/stock/repositories/InMemoryLocationRepository.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { RecipePreparation } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { StockMovementRecord } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { Clock } from '../../../domain/shared/Clock.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';
import { PreparationBalanceMismatchException } from '../../../domain/kitchen/errors/PreparationBalanceMismatchException.js';
import { NonPristineReturnException } from '../../../domain/kitchen/errors/NonPristineReturnException.js';
import { PreparationNotOpenException } from '../../../domain/kitchen/errors/PreparationNotOpenException.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

const NOW = new Date('2026-09-04T18:00:00.000Z');
const fixedClock: Clock = { now: () => NOW };

class SeqIds implements IdGenerator {
  private n = 0;
  next(prefix: string): string {
    this.n += 1;
    return `${prefix}-${this.n}`;
  }
}

const PREP_ID = 'prep-1';
const EXP = new Date('2026-09-06T00:00:00.000Z');
const PREP_AREA = 'loc-seed-kitchen-prep'; // "Mesa de Preparación"

function seedRemanente(
  stock: InMemoryStockRepository,
  qty: string,
  opts: { isPristine?: boolean; id?: string; insumoId?: string } = {}
): Remanente {
  const r = new Remanente({
    id: opts.id ?? 'rem-1',
    insumoId: opts.insumoId ?? 'ins-1',
    currentQuantity: new DecimalQuantity(qty),
    initialQuantity: new DecimalQuantity(qty),
    location: 'Mesa de Preparación',
    storageLocationId: PREP_AREA,
    recipePreparationId: PREP_ID,
    status: 'ACTIVE',
    expirationDate: EXP,
    isPristine: opts.isPristine ?? true,
  });
  stock.seedRemanente(r);
  return r;
}

function mv(stock: InMemoryStockRepository, type: string): StockMovementRecord | undefined {
  return stock.movements.find((m) => m.type === type);
}

describe('ClosePreparationUseCase (US-028)', () => {
  let stock: InMemoryStockRepository;
  let locations: InMemoryLocationRepository;
  let prepRepo: { findById: (id: string) => Promise<RecipePreparation | null> };
  let useCase: ClosePreparationUseCase;

  beforeEach(() => {
    stock = new InMemoryStockRepository();
    locations = new InMemoryLocationRepository();
    stock.seedInsumo(
      new Insumo({
        id: 'ins-1',
        name: 'Mozzarella',
        unitOfMeasure: 'KG',
        stockLines: [{ storageLocationId: 'loc-seed-dry', quantity: new DecimalQuantity('10.000') }],
      })
    );
    stock.recipePreparations.set(PREP_ID, RecipePreparation.openNew(PREP_ID, 'rec-1', 8, 'op-1', NOW));
    prepRepo = { findById: async (id) => stock.recipePreparations.get(id) ?? null };
    useCase = new ClosePreparationUseCase(prepRepo as never, locations, stock, fixedClock, new SeqIds());
  });

  it('Escenario 1: consumo + sobrante en otra área de cocina + merma con motivo', async () => {
    seedRemanente(stock, '2.000');

    const result = await useCase.execute({
      preparationId: PREP_ID,
      actualPortions: 8,
      closedByOperatorId: 'op-2',
      items: [
        {
          insumoId: 'ins-1',
          leftoverQty: '0.300',
          leftoverLocationId: 'loc-seed-kitchen-fridge', // "Refrigerador Principal Cocina"
          wastedQty: '0.100',
          wasteReason: 'recorte no aprovechable',
        },
      ],
    });

    // --- result DTO (buildResult) ---
    expect(result).toMatchObject({
      id: PREP_ID,
      recipeId: 'rec-1',
      status: 'CLOSED',
      actualPortions: 8,
      closedByOperatorId: 'op-2',
      closedAt: NOW.toISOString(),
    });
    expect(result.items[0]).toEqual({
      insumoId: 'ins-1',
      extractedQty: '2.000',
      consumedQty: '1.600',
      leftoverQty: '0.300',
      leftoverLocationId: 'loc-seed-kitchen-fridge',
      wastedQty: '0.100',
      wasteReason: 'recorte no aprovechable',
    });

    // --- remanente end state ---
    const rem = await stock.findRemanenteById('rem-1');
    expect(rem?.currentQuantity.toString()).toBe('0.300');
    expect(rem?.status).toBe('ACTIVE');
    expect(rem?.location).toBe('Refrigerador Principal Cocina');
    expect(rem?.storageLocationId).toBe('loc-seed-kitchen-fridge');
    expect(rem?.recipePreparationId).toBeUndefined();
    expect(rem?.expirationDate.toISOString()).toBe(EXP.toISOString());

    // --- CONSUMPTION_RECIPE movement fields ---
    const cons = mv(stock, 'CONSUMPTION_RECIPE')!;
    expect(cons).toMatchObject({
      insumoId: 'ins-1',
      quantity: '1.600',
      fromLoc: 'Mesa de Preparación',
      toLoc: 'RECIPE:rec-1',
      operatorId: 'op-2',
      recipeId: 'rec-1',
    });
    expect(cons.createdAt).toEqual(NOW);

    // --- DISCARD_RECIPE_PREP movement fields ---
    expect(mv(stock, 'DISCARD_RECIPE_PREP')).toMatchObject({
      quantity: '0.100',
      fromLoc: 'Mesa de Preparación',
      toLoc: 'MERMA',
      reason: 'recorte no aprovechable',
      recipeId: 'rec-1',
    });

    // --- TRANSFER_KITCHEN movement fields (fromLoc is the ORIGINAL area) ---
    expect(mv(stock, 'TRANSFER_KITCHEN')).toMatchObject({
      quantity: '0.300',
      fromLoc: 'Mesa de Preparación',
      toLoc: 'Refrigerador Principal Cocina',
      recipeId: 'rec-1',
    });

    expect(stock.movements.map((m) => m.type).sort()).toEqual([
      'CONSUMPTION_RECIPE',
      'DISCARD_RECIPE_PREP',
      'TRANSFER_KITCHEN',
    ]);
    expect(stock.recipePreparations.get(PREP_ID)?.status).toBe('CLOSED');
    expect(stock.recipePreparationItems.size).toBe(1);
  });

  it('sobrante que queda en la MISMA área: sin TRANSFER_KITCHEN, remanente ACTIVE y desvinculado', async () => {
    seedRemanente(stock, '2.000');

    await useCase.execute({
      preparationId: PREP_ID,
      actualPortions: 8,
      closedByOperatorId: 'op-2',
      items: [{ insumoId: 'ins-1', leftoverQty: '0.500', wastedQty: '0' }],
    });

    const rem = await stock.findRemanenteById('rem-1');
    expect(rem?.currentQuantity.toString()).toBe('0.500');
    expect(rem?.status).toBe('ACTIVE');
    expect(rem?.storageLocationId).toBe(PREP_AREA);
    expect(rem?.recipePreparationId).toBeUndefined();
    expect(stock.movements.map((m) => m.type)).toEqual(['CONSUMPTION_RECIPE']);
  });

  it('ingrediente omitido en items → se concilia como consumo total', async () => {
    seedRemanente(stock, '1.200');

    const result = await useCase.execute({ preparationId: PREP_ID, actualPortions: 8, items: [] });

    expect(result.items[0]).toMatchObject({ consumedQty: '1.200', leftoverQty: '0.000', wastedQty: '0.000', wasteReason: null, leftoverLocationId: null });
    expect((await stock.findRemanenteById('rem-1'))?.status).toBe('EXHAUSTED');
    expect(stock.movements.map((m) => m.type)).toEqual(['CONSUMPTION_RECIPE']);
  });

  it('dos entradas de items para el mismo insumo → rechazo (cuadre)', async () => {
    seedRemanente(stock, '2.000');
    await expect(
      useCase.execute({
        preparationId: PREP_ID,
        actualPortions: 8,
        items: [
          { insumoId: 'ins-1', leftoverQty: '0.5', wastedQty: '0' },
          { insumoId: 'ins-1', leftoverQty: '0.5', wastedQty: '0' },
        ],
      })
    ).rejects.toBeInstanceOf(PreparationBalanceMismatchException);
  });

  it('Escenario 2: cuadre inválido (400) — no persiste nada', async () => {
    seedRemanente(stock, '2.000');

    await expect(
      useCase.execute({
        preparationId: PREP_ID,
        actualPortions: 8,
        items: [{ insumoId: 'ins-1', leftoverQty: '1.800', wastedQty: '0.500', wasteReason: 'x' }],
      })
    ).rejects.toBeInstanceOf(PreparationBalanceMismatchException);

    expect(stock.movements).toHaveLength(0);
    expect(stock.recipePreparationItems.size).toBe(0);
    expect(stock.recipePreparations.get(PREP_ID)?.status).toBe('OPEN');
    expect((await stock.findRemanenteById('rem-1'))?.currentQuantity.toString()).toBe('2.000');
  });

  it('Escenario 3: devolución a bodega de un sobrante intacto → RETURN_TO_WAREHOUSE + WarehouseStock += leftover', async () => {
    seedRemanente(stock, '2.000', { isPristine: true });

    const result = await useCase.execute({
      preparationId: PREP_ID,
      actualPortions: 8,
      closedByOperatorId: 'op-2',
      items: [
        { insumoId: 'ins-1', leftoverQty: '2.000', leftoverLocationId: 'loc-seed-dry', markedUnopened: true, wastedQty: '0' },
      ],
    });

    expect(result.items[0]).toMatchObject({ consumedQty: '0.000', wastedQty: '0.000', leftoverLocationId: 'loc-seed-dry' });
    expect((await stock.findById('ins-1'))?.stockAt('loc-seed-dry').toString()).toBe('12.000');

    const rem = await stock.findRemanenteById('rem-1');
    expect(rem?.status).toBe('EXHAUSTED');
    expect(rem?.currentQuantity.toNumber()).toBe(0);

    expect(mv(stock, 'RETURN_TO_WAREHOUSE')).toMatchObject({
      quantity: '2.000',
      fromLoc: 'Mesa de Preparación',
      toLoc: 'Bodega de Secos',
      recipeId: 'rec-1',
      operatorId: 'op-2',
    });
    expect(stock.movements.map((m) => m.type)).toEqual(['RETURN_TO_WAREHOUSE']);
    // sin consumo → no hay CONSUMPTION_RECIPE
    expect(mv(stock, 'CONSUMPTION_RECIPE')).toBeUndefined();
  });

  it('Escenario 4: devolución a bodega bloqueada si el remanente no está intacto (422)', async () => {
    seedRemanente(stock, '2.000', { isPristine: false });

    await expect(
      useCase.execute({
        preparationId: PREP_ID,
        actualPortions: 8,
        items: [
          { insumoId: 'ins-1', leftoverQty: '2.000', leftoverLocationId: 'loc-seed-dry', markedUnopened: true, wastedQty: '0' },
        ],
      })
    ).rejects.toBeInstanceOf(NonPristineReturnException);
    expect((await stock.findById('ins-1'))?.stockAt('loc-seed-dry').toString()).toBe('10.000');
  });

  it('Escenario 5: cierre sin sobrante ni merma → EXHAUSTED, solo CONSUMPTION_RECIPE, actualPortions distinto de planned', async () => {
    seedRemanente(stock, '1.600');

    const result = await useCase.execute({
      preparationId: PREP_ID,
      actualPortions: 7,
      items: [{ insumoId: 'ins-1', leftoverQty: '0', wastedQty: '0' }],
    });

    expect(result.actualPortions).toBe(7);
    expect(result.items[0].consumedQty).toBe('1.600');
    expect((await stock.findRemanenteById('rem-1'))?.status).toBe('EXHAUSTED');
    expect(stock.movements.map((m) => m.type)).toEqual(['CONSUMPTION_RECIPE']);
  });

  it('destino de sobrante inactivo o inexistente → 404', async () => {
    seedRemanente(stock, '2.000');
    await locations.deleteLocation('loc-seed-kitchen-fridge'); // ahora no existe

    await expect(
      useCase.execute({
        preparationId: PREP_ID,
        actualPortions: 8,
        items: [{ insumoId: 'ins-1', leftoverQty: '0.300', leftoverLocationId: 'loc-seed-kitchen-fridge', wastedQty: '0' }],
      })
    ).rejects.toBeInstanceOf(EntityNotFoundException);
  });

  it('sin closedByOperatorId → el resultado y los movimientos lo dejan en null/undefined', async () => {
    seedRemanente(stock, '1.000');
    const result = await useCase.execute({ preparationId: PREP_ID, actualPortions: 8, items: [] });
    expect(result.closedByOperatorId).toBeNull();
    expect(mv(stock, 'CONSUMPTION_RECIPE')?.operatorId).toBeUndefined();
  });

  it('un segundo cierre lanza 409', async () => {
    seedRemanente(stock, '1.000');
    await useCase.execute({ preparationId: PREP_ID, actualPortions: 8, items: [] });
    await expect(
      useCase.execute({ preparationId: PREP_ID, actualPortions: 8, items: [] })
    ).rejects.toBeInstanceOf(PreparationNotOpenException);
  });

  it('preparación inexistente → 404', async () => {
    await expect(
      useCase.execute({ preparationId: 'nope', actualPortions: 1, items: [] })
    ).rejects.toBeInstanceOf(EntityNotFoundException);
  });
});

describe('AbandonPreparationUseCase (US-028 Escenario 6)', () => {
  let stock: InMemoryStockRepository;
  let prepRepo: { findById: (id: string) => Promise<RecipePreparation | null> };
  let useCase: AbandonPreparationUseCase;

  beforeEach(() => {
    stock = new InMemoryStockRepository();
    stock.recipePreparations.set(PREP_ID, RecipePreparation.openNew(PREP_ID, 'rec-1', 8, 'op-1', NOW));
    prepRepo = { findById: async (id) => stock.recipePreparations.get(id) ?? null };
    useCase = new AbandonPreparationUseCase(prepRepo as never, stock, fixedClock);
  });

  it('marca ABANDONED, desvincula los remanentes y no asume merma', async () => {
    seedRemanente(stock, '2.000');
    seedRemanente(stock, '1.000', { id: 'rem-2', insumoId: 'ins-2' });

    const result = await useCase.execute({ preparationId: PREP_ID, closedByOperatorId: 'op-9' });

    expect(result).toEqual({
      id: PREP_ID,
      status: 'ABANDONED',
      unlinkedRemanentes: 2,
      closedAt: NOW.toISOString(),
    });
    for (const id of ['rem-1', 'rem-2']) {
      const rem = await stock.findRemanenteById(id);
      expect(rem?.status).toBe('ACTIVE');
      expect(rem?.recipePreparationId).toBeUndefined();
    }
    expect(stock.movements).toHaveLength(0);
    expect(stock.recipePreparations.get(PREP_ID)?.status).toBe('ABANDONED');
    expect(stock.recipePreparations.get(PREP_ID)?.closedByOperatorId).toBe('op-9');
  });

  it('abandonar una preparación ya cerrada → 409', async () => {
    stock.recipePreparations.get(PREP_ID)!.close(8, 'op-1', NOW);
    await expect(
      useCase.execute({ preparationId: PREP_ID })
    ).rejects.toBeInstanceOf(PreparationNotOpenException);
  });

  it('preparación inexistente → 404', async () => {
    await expect(useCase.execute({ preparationId: 'nope' })).rejects.toBeInstanceOf(EntityNotFoundException);
  });
});
