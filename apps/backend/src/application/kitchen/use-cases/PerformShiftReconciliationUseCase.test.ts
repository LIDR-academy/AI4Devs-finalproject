import { describe, it, expect, beforeEach } from 'vitest';
import { PerformShiftReconciliationUseCase } from './PerformShiftReconciliationUseCase.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryShiftReconciliationRepository } from '../../../infrastructure/kitchen/repositories/InMemoryShiftReconciliationRepository.js';
import { InMemoryConsumptionReasonRepository } from '../../../infrastructure/kitchen/repositories/InMemoryConsumptionReasonRepository.js';
import { ActiveRemanenteDTO, IRemanenteQueryRepository } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

class InMemoryRemanenteQueryRepository implements IRemanenteQueryRepository {
  constructor(private readonly stockRepo: InMemoryStockRepository) {}

  public async findActiveRemanentes(): Promise<ActiveRemanenteDTO[]> {
    const activeRemanentes: ActiveRemanenteDTO[] = [];
    for (const rem of Array.from(this.stockRepo.remanentes.values())) {
      if (rem.status === 'ACTIVE') {
        activeRemanentes.push({
          id: rem.id,
          insumoId: rem.insumoId,
          insumoName: 'Insumo Test',
          unitOfMeasure: 'KG',
          currentQuantity: rem.currentQuantity.toString(),
          initialQuantity: rem.initialQuantity.toString(),
          location: rem.location,
          expirationDate: rem.expirationDate,
          status: rem.status,
          createdAt: new Date(),
        });
      }
    }
    return activeRemanentes;
  }
}

describe('TK-009: PerformShiftReconciliationUseCase TDD Suite', () => {
  let stockRepo: InMemoryStockRepository;
  let queryRepo: InMemoryRemanenteQueryRepository;
  let reconRepo: InMemoryShiftReconciliationRepository;
  let reasonRepo: InMemoryConsumptionReasonRepository;
  let useCase: PerformShiftReconciliationUseCase;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    queryRepo = new InMemoryRemanenteQueryRepository(stockRepo);
    reconRepo = new InMemoryShiftReconciliationRepository();
    reasonRepo = new InMemoryConsumptionReasonRepository();
    useCase = new PerformShiftReconciliationUseCase(stockRepo, queryRepo, reconRepo, reasonRepo);
  });

  it('debe descartar de forma automatica remanentes cuya fecha de expiracion haya pasado', async () => {
    const expiredDate = new Date(Date.now() - 3600000); // 1 hora en el pasado
    const validDate = new Date(Date.now() + 86400000); // 1 dia en el futuro

    const expiredRem = new Remanente({
      id: 'rem-exp',
      insumoId: 'ins-1',
      currentQuantity: new DecimalQuantity(1.5),
      initialQuantity: new DecimalQuantity(1.5),
      location: 'KITCHEN_FRIDGE',
      expirationDate: expiredDate,
      status: 'ACTIVE',
    });

    const validRem = new Remanente({
      id: 'rem-val',
      insumoId: 'ins-1',
      currentQuantity: new DecimalQuantity(2.0),
      initialQuantity: new DecimalQuantity(2.0),
      location: 'KITCHEN_FRIDGE',
      expirationDate: validDate,
      status: 'ACTIVE',
    });

    await stockRepo.saveRemanente(expiredRem);
    await stockRepo.saveRemanente(validRem);

    const result = await useCase.execute({
      operatorId: 'user-op-1',
      notes: 'Cierre de turno noche',
      items: [
        { remanenteId: 'rem-val', physicalQuantity: '1.800', reasonId: 'reason-seed-1' }
      ],
    });

    expect(result.autoDiscardedCount).toBe(1);

    const updatedExpired = await stockRepo.findRemanenteById('rem-exp');
    expect(updatedExpired?.status).toBe('DISCARDED');

    const updatedValid = await stockRepo.findRemanenteById('rem-val');
    expect(updatedValid?.currentQuantity.toString()).toBe('1.800');

    const reconciliations = await reconRepo.findAll();
    expect(reconciliations.length).toBe(1);
    expect(reconciliations[0].items[0].variance.toFixed(3)).toBe('-0.200');
  });

  // ADR-004 / US-008 / TK-109: motivo obligatorio en varianza negativa + bugfix de superávit.
  describe('TK-109: motivo en varianza negativa (ADR-004) + sincronización de superávit', () => {
    const seedRemanente = async (id: string, quantity: string) => {
      const rem = new Remanente({
        id,
        insumoId: 'ins-1',
        currentQuantity: new DecimalQuantity(quantity),
        initialQuantity: new DecimalQuantity(quantity),
        location: 'KITCHEN_FRIDGE',
        expirationDate: new Date(Date.now() + 86400000),
        status: 'ACTIVE',
      });
      await stockRepo.saveRemanente(rem);
      return rem;
    };

    it('varianza negativa SIN reasonId -> ConsumptionReasonRequiredException, ninguna línea se aplica', async () => {
      await seedRemanente('rem-1', '2.000');

      await expect(
        useCase.execute({
          operatorId: 'op-1',
          items: [{ remanenteId: 'rem-1', physicalQuantity: '1.500' }],
        })
      ).rejects.toThrow(/motivo de la varianza negativa/i);

      const updated = await stockRepo.findRemanenteById('rem-1');
      expect(updated?.currentQuantity.toString()).toBe('2.000');
      expect(stockRepo.movements).toHaveLength(0);
      expect(await reconRepo.findAll()).toHaveLength(0);
    });

    it('varianza negativa con reasonId inexistente -> EntityNotFoundException, ninguna línea se aplica', async () => {
      await seedRemanente('rem-1', '2.000');

      await expect(
        useCase.execute({
          operatorId: 'op-1',
          items: [{ remanenteId: 'rem-1', physicalQuantity: '1.500', reasonId: 'reason-does-not-exist' }],
        })
      ).rejects.toThrow();

      const updated = await stockRepo.findRemanenteById('rem-1');
      expect(updated?.currentQuantity.toString()).toBe('2.000');
      expect(stockRepo.movements).toHaveLength(0);
    });

    it('varianza negativa con motivo desactivado -> InactiveConsumptionReasonException, ninguna línea se aplica', async () => {
      await seedRemanente('rem-1', '2.000');
      const inactiveReason = (await reasonRepo.findById('reason-seed-2'))!;
      inactiveReason.deactivate();
      await reasonRepo.save(inactiveReason);

      await expect(
        useCase.execute({
          operatorId: 'op-1',
          items: [{ remanenteId: 'rem-1', physicalQuantity: '1.500', reasonId: 'reason-seed-2' }],
        })
      ).rejects.toThrow();

      const updated = await stockRepo.findRemanenteById('rem-1');
      expect(updated?.currentQuantity.toString()).toBe('2.000');
      expect(stockRepo.movements).toHaveLength(0);
    });

    it('varianza negativa con reasonId válido -> aplica y el movimiento queda con reasonId', async () => {
      await seedRemanente('rem-1', '2.000');

      const result = await useCase.execute({
        operatorId: 'op-1',
        items: [{ remanenteId: 'rem-1', physicalQuantity: '1.500', reasonId: 'reason-seed-1' }],
      });

      expect(result.processedItemsCount).toBe(1);
      const updated = await stockRepo.findRemanenteById('rem-1');
      expect(updated?.currentQuantity.toString()).toBe('1.500');
      expect(stockRepo.movements).toHaveLength(1);
      expect(stockRepo.movements[0]).toMatchObject({ type: 'SHIFT_RECONCILIATION_VARIANCE', reasonId: 'reason-seed-1' });
    });

    it('varianza positiva (superávit) sincroniza currentQuantity SIN exigir motivo (bugfix)', async () => {
      await seedRemanente('rem-1', '2.000');

      const result = await useCase.execute({
        operatorId: 'op-1',
        items: [{ remanenteId: 'rem-1', physicalQuantity: '2.300' }],
      });

      expect(result.processedItemsCount).toBe(1);
      const updated = await stockRepo.findRemanenteById('rem-1');
      // Antes de TK-109 este era el bug: el movimiento se registraba pero currentQuantity
      // nunca se sincronizaba con el superávit encontrado en el conteo físico.
      expect(updated?.currentQuantity.toString()).toBe('2.300');
      expect(updated?.status).toBe('ACTIVE');
      expect(stockRepo.movements).toHaveLength(1);
      expect(stockRepo.movements[0].reasonId).toBeUndefined();
    });

    it('mezcla de líneas positiva + negativa en el mismo cierre: ambas se aplican si la negativa trae motivo', async () => {
      await seedRemanente('rem-pos', '2.000');
      await seedRemanente('rem-neg', '2.000');

      const result = await useCase.execute({
        operatorId: 'op-1',
        items: [
          { remanenteId: 'rem-pos', physicalQuantity: '2.200' },
          { remanenteId: 'rem-neg', physicalQuantity: '1.700', reasonId: 'reason-seed-1' },
        ],
      });

      expect(result.processedItemsCount).toBe(2);
      expect((await stockRepo.findRemanenteById('rem-pos'))?.currentQuantity.toString()).toBe('2.200');
      expect((await stockRepo.findRemanenteById('rem-neg'))?.currentQuantity.toString()).toBe('1.700');
    });

    it('mezcla de líneas: si la línea negativa NO trae motivo, NINGUNA de las dos se aplica (ni la positiva)', async () => {
      await seedRemanente('rem-pos', '2.000');
      await seedRemanente('rem-neg', '2.000');

      await expect(
        useCase.execute({
          operatorId: 'op-1',
          items: [
            { remanenteId: 'rem-pos', physicalQuantity: '2.200' },
            { remanenteId: 'rem-neg', physicalQuantity: '1.700' },
          ],
        })
      ).rejects.toThrow();

      expect((await stockRepo.findRemanenteById('rem-pos'))?.currentQuantity.toString()).toBe('2.000');
      expect((await stockRepo.findRemanenteById('rem-neg'))?.currentQuantity.toString()).toBe('2.000');
      expect(stockRepo.movements).toHaveLength(0);
    });
  });
});
