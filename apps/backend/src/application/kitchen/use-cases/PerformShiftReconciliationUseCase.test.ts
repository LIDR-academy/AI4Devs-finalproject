import { describe, it, expect, beforeEach } from 'vitest';
import { PerformShiftReconciliationUseCase } from './PerformShiftReconciliationUseCase.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryShiftReconciliationRepository } from '../../../infrastructure/kitchen/repositories/InMemoryShiftReconciliationRepository.js';
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
  let useCase: PerformShiftReconciliationUseCase;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    queryRepo = new InMemoryRemanenteQueryRepository(stockRepo);
    reconRepo = new InMemoryShiftReconciliationRepository();
    useCase = new PerformShiftReconciliationUseCase(stockRepo, queryRepo, reconRepo);
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
        { remanenteId: 'rem-val', physicalQuantity: '1.800' }
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
});
