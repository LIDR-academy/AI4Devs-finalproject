import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { Insumo } from '../../src/domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';

/** Abre una preparación real vía extracción RECIPE y devuelve su id + el del remanente. */
async function openPreparation(app: ReturnType<typeof createApp>, quantity = '2.000') {
  const ext = await request(app)
    .post('/api/v1/stock/extraction')
    .send({
      insumoId: 'ins-1',
      fromStorageLocationId: 'loc-1',
      quantity,
      purpose: 'RECIPE',
      recipeId: 'rec-1',
      plannedPortions: 8,
      operatorId: 'usr-op-1',
    });
  expect(ext.status).toBe(201);
  return { preparationId: ext.body.recipePreparationId as string, remanenteId: ext.body.remanenteId as string };
}

describe('US-028 / TK-104: cierre y abandono de preparación (HTTP)', () => {
  let stockRepo: InMemoryStockRepository;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    stockRepo.seedInsumo(
      new Insumo({
        id: 'ins-1',
        name: 'Mozzarella',
        unitOfMeasure: 'KG',
        stockLines: [{ storageLocationId: 'loc-1', quantity: new DecimalQuantity('10.000') }],
      })
    );
  });

  it('cierre feliz: consumo + sobrante en cocina + merma con motivo → 200 y CLOSED', async () => {
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });
    const { preparationId } = await openPreparation(app);

    const res = await request(app)
      .post(`/api/v1/kitchen/recipe-preparations/${preparationId}/close`)
      .send({
        actualPortions: 8,
        closedByOperatorId: 'usr-op-2',
        items: [
          {
            insumoId: 'ins-1',
            leftoverQty: '0.300',
            leftoverLocationId: 'loc-seed-kitchen-fridge',
            wastedQty: '0.100',
            wasteReason: 'recorte no aprovechable',
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CLOSED');
    expect(res.body.items[0].consumedQty).toBe('1.600');

    const board = await request(app).get('/api/v1/kitchen/recipe-preparations?status=OPEN');
    expect(board.body).toHaveLength(0);
    const types = stockRepo.movements.map((m) => m.type).sort();
    expect(types).toEqual(['CONSUMPTION_RECIPE', 'DISCARD_RECIPE_PREP', 'EXTRACTION_RECIPE', 'TRANSFER_KITCHEN']);
  });

  it('cuadre inválido → 400 y la preparación sigue OPEN', async () => {
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });
    const { preparationId } = await openPreparation(app);

    const res = await request(app)
      .post(`/api/v1/kitchen/recipe-preparations/${preparationId}/close`)
      .send({ actualPortions: 8, items: [{ insumoId: 'ins-1', leftoverQty: '1.900', wastedQty: '0.500', wasteReason: 'x' }] });

    expect(res.status).toBe(400);
    const board = await request(app).get('/api/v1/kitchen/recipe-preparations?status=OPEN');
    expect(board.body).toHaveLength(1);
  });

  it('devolución a bodega bloqueada si hubo consumo → 422', async () => {
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });
    const { preparationId } = await openPreparation(app);

    const res = await request(app)
      .post(`/api/v1/kitchen/recipe-preparations/${preparationId}/close`)
      .send({
        actualPortions: 8,
        items: [{ insumoId: 'ins-1', leftoverQty: '1.500', leftoverLocationId: 'loc-seed-dry', markedUnopened: true, wastedQty: '0' }],
      });

    expect(res.status).toBe(422);
  });

  it('merma sin motivo → 400 (frontera Zod)', async () => {
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });
    const { preparationId } = await openPreparation(app);

    const res = await request(app)
      .post(`/api/v1/kitchen/recipe-preparations/${preparationId}/close`)
      .send({ actualPortions: 8, items: [{ insumoId: 'ins-1', leftoverQty: '0', wastedQty: '0.200' }] });

    expect(res.status).toBe(400);
    expect(res.body.detail).toMatch(/motivo de la merma/i);
  });

  it('abandono: ABANDONED, remanente ACTIVE y sin merma', async () => {
    const app = createApp({ stockRepository: stockRepo, requireAuth: false });
    const { preparationId, remanenteId } = await openPreparation(app);

    const res = await request(app)
      .post(`/api/v1/kitchen/recipe-preparations/${preparationId}/abandon`)
      .send({ closedByOperatorId: 'usr-op-2' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ABANDONED');
    const rem = await stockRepo.findRemanenteById(remanenteId);
    expect(rem?.status).toBe('ACTIVE');
    expect(rem?.recipePreparationId).toBeUndefined();
  });
});
