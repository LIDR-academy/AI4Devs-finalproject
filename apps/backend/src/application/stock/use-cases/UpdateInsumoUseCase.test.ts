import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateInsumoUseCase } from './UpdateInsumoUseCase.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { InsumoAlreadyExistsException } from '../../../domain/stock/errors/InsumoAlreadyExistsException.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

describe('TK-130: UpdateInsumoUseCase (US-036)', () => {
  let repo: InMemoryStockRepository;
  let useCase: UpdateInsumoUseCase;

  beforeEach(() => {
    repo = new InMemoryStockRepository();
    useCase = new UpdateInsumoUseCase(repo);
    repo.seedInsumo(
      new Insumo({
        id: 'ins-1',
        name: 'Harina 00',
        unitOfMeasure: 'KG',
        stockLines: [{ storageLocationId: 'loc-a', quantity: new DecimalQuantity('4.000') }],
      })
    );
  });

  it('edita name y fija unitCost, preservando unitOfMeasure y líneas de stock', async () => {
    const dto = await useCase.execute({ id: 'ins-1', name: '  Harina 000 ', unitCost: '820.00' });

    expect(dto).toMatchObject({ name: 'Harina 000', unitCost: '820.00', unitOfMeasure: 'KG', warehouseStock: '4.000' });
    const stored = await repo.findById('ins-1');
    expect(stored?.stockLines[0]).toMatchObject({ storageLocationId: 'loc-a' });
  });

  it('unitCost:null limpia el costo; los campos ausentes se conservan', async () => {
    await useCase.execute({ id: 'ins-1', unitCost: '10.00' });
    const dto = await useCase.execute({ id: 'ins-1', unitCost: null });
    expect(dto.unitCost).toBeNull();
    expect(dto.name).toBe('Harina 00');
  });

  it('lanza EntityNotFoundException si el insumo no existe', async () => {
    await expect(useCase.execute({ id: 'ins-x', name: 'Y' })).rejects.toBeInstanceOf(EntityNotFoundException);
  });

  it('lanza InsumoAlreadyExistsException si el nuevo nombre pertenece a otro insumo', async () => {
    repo.seedInsumo(new Insumo({ id: 'ins-2', name: 'Sal', unitOfMeasure: 'KG' }));
    await expect(useCase.execute({ id: 'ins-1', name: 'Sal' })).rejects.toBeInstanceOf(InsumoAlreadyExistsException);
  });

  it('renombrar al MISMO nombre (sin cambio real) no lanza conflicto', async () => {
    const dto = await useCase.execute({ id: 'ins-1', name: 'Harina 00' });
    expect(dto.name).toBe('Harina 00');
  });

  it('lanza conflicto si el barcode pertenece a otro insumo, pero no si es el propio', async () => {
    repo.seedInsumo(new Insumo({ id: 'ins-2', name: 'Leche', unitOfMeasure: 'L', barcode: '779000' }));
    await expect(useCase.execute({ id: 'ins-1', barcode: '779000' })).rejects.toBeInstanceOf(InsumoAlreadyExistsException);

    await useCase.execute({ id: 'ins-1', barcode: '888111' });
    const dto = await useCase.execute({ id: 'ins-1', barcode: '888111' }); // mismo valor, sin colisión consigo mismo
    expect(dto.barcode).toBe('888111');
  });

  it('barcode:null limpia el código', async () => {
    await useCase.execute({ id: 'ins-1', barcode: '999' });
    const dto = await useCase.execute({ id: 'ins-1', barcode: null });
    expect(dto.barcode).toBeNull();
  });
});
